import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParkingSessionRepository } from '../infrastructure/parking-session.repository';
import { ParkingSpaceRepository } from '../../parking-spaces/infrastructure/parking-space.repository';
import { PriceRepository } from '../../prices/infrastructure/price.repository';
import { CheckInDto } from '../interface/dtos/check-in.dto';
import { CheckInResponseDto } from '../interface/dtos/check-in-response.dto';
import { CheckOutDto } from '../interface/dtos/check-out.dto';
import { CheckOutResponseDto } from '../interface/dtos/check-out-response.dto';
import { ParkingSession } from './parking-session.entity';
import { ParkingSpace } from '../../parking-spaces/domain/parking-space.entity';

@Injectable()
export class ParkingSessionsService {
  constructor(
    private readonly parkingSessionRepository: ParkingSessionRepository,
    private readonly parkingSpaceRepository: ParkingSpaceRepository,
    private readonly priceRepository: PriceRepository,
    private readonly dataSource: DataSource,
  ) {}

  async checkIn(dto: CheckInDto): Promise<CheckInResponseDto> {
    const { buildingId, vehicleType, isResident } = dto;

    try {
      return await this.dataSource.transaction(async (entityManager) => {
        const availableSpace = await this.parkingSpaceRepository.getAvailableSpace(
          buildingId,
          vehicleType,
          isResident,
          entityManager,
        );

        if (!availableSpace) {
          throw new ConflictException('No empty spaces available.');
        }

        let ratePerHour = 0;

        if (!isResident) {
          const prices = await this.priceRepository.getBy(buildingId, vehicleType);
          if (!prices || prices.length === 0) {
            throw new InternalServerErrorException(
              'Error creating parking session. Price not configured for this vehicle type.',
            );
          }

          ratePerHour = Number(prices[0].ratePerHour);
        }

        const parkingSession = ParkingSession.create(
          availableSpace.id,
          vehicleType,
          isResident,
          ratePerHour,
        );

        const savedSession = await entityManager.save(ParkingSession, parkingSession);

        availableSpace.occupy(savedSession.id);

        await entityManager.save(ParkingSpace, availableSpace);

        return {
          parkingSessionId: savedSession.id,
          parkingSpaceId: availableSpace.id,
        };
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error creating parking session.');
    }
  }

  async checkOut(dto: CheckOutDto): Promise<CheckOutResponseDto> {
    const { parkingSessionId, isResident } = dto;

    try {
      const session = await this.parkingSessionRepository.findById(parkingSessionId);

      if (!session) {
        throw new NotFoundException('Parking session not found.');
      }

      if (!session.isActive()) {
        throw new BadRequestException('Parking session is already finished.');
      }

      if (session.isResident !== isResident) {
        throw new UnprocessableEntityException(
          `Invalid isResident value. Session is ${session.isResident ? 'for residents' : 'for non-residents'}.`,
        );
      }

      return await this.dataSource.transaction(async (entityManager) => {
          const parkingSpace = await this.parkingSpaceRepository.findById(session.parkingSpaceId);
          if (!parkingSpace) {
              throw new NotFoundException('Parking space not found.');
          }
        session.checkOut();
        await entityManager.save(ParkingSession, session);
        parkingSpace.release();
        await entityManager.save(ParkingSpace, parkingSpace);

        return {
          sessionLengthInHoursMinutes: session.getDurationInHours(),
          parkingSpaceId: session.parkingSpaceId,
          calculatedCharge: Number(session.calculatedCharge),
          fee: Number(session.ratePerHour),
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error finishing parking session.');
    }
  }
}
