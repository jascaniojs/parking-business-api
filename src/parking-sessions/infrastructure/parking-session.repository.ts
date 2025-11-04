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

  async findById(id: number): Promise<ParkingSession | null> {
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
}
