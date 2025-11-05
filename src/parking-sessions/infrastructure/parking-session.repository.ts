import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ParkingSession } from '../domain/parking-session.entity';

@Injectable()
export class ParkingSessionRepository {
  constructor(
    @InjectRepository(ParkingSession)
    private readonly repository: Repository<ParkingSession>,
  ) {}

  async save(session: ParkingSession): Promise<ParkingSession> {
    return this.repository.save(session);
  }

  async findById(id: string): Promise<ParkingSession | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['parkingSpace'],
    });
  }

  async findActiveSessionBySpaceId(parkingSpaceId: number): Promise<ParkingSession | null> {
    return this.repository.findOne({
      where: {
        parkingSpaceId,
        checkOutAt: IsNull(),
      },
    });
  }

  async findActiveSessions(): Promise<ParkingSession[]> {
    return this.repository.find({
      where: { checkOutAt: IsNull() },
      relations: ['parkingSpace'],
      order: { checkInAt: 'DESC' },
    });
  }

  async findSessionsBySpaceId(parkingSpaceId: number): Promise<ParkingSession[]> {
    return this.repository.find({
      where: { parkingSpaceId },
      order: { checkInAt: 'DESC' },
    });
  }

  async update(session: ParkingSession): Promise<ParkingSession> {
    return this.repository.save(session);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findCompletedNonResidentSessions(
    filters: {
      startDate?: Date;
      endDate?: Date;
      parkingSpaceId?: number;
    },
    page: number,
    limit: number,
  ): Promise<[ParkingSession[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('session')
      .where('session.isResident = :isResident', { isResident: false })
      .andWhere('session.checkOutAt IS NOT NULL');

    if (filters.startDate) {
      queryBuilder.andWhere('session.checkOutAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('session.checkOutAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.parkingSpaceId) {
      queryBuilder.andWhere('session.parkingSpaceId = :parkingSpaceId', {
        parkingSpaceId: filters.parkingSpaceId,
      });
    }

    queryBuilder
      .orderBy('session.checkOutAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }
}
