import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingSpace } from '../domain/parking-space.entity';
import { VehicleType } from '../domain/vehicle-type.enum';

@Injectable()
export class ParkingSpaceRepository {
  constructor(
    @InjectRepository(ParkingSpace)
    private readonly repository: Repository<ParkingSpace>,
  ) {}

  async save(space: ParkingSpace): Promise<ParkingSpace> {
    return this.repository.save(space);
  }

  async findById(id: number): Promise<ParkingSpace | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByBuildingId(buildingId: number): Promise<ParkingSpace[]> {
    return this.repository.find({
      where: { buildingId },
      order: { floor: 'ASC', number: 'ASC' },
    });
  }

  async getAvailableSpace(
    buildingId: string,
    vehicleType: VehicleType,
    isResident: boolean,
  ): Promise<ParkingSpace | null> {
    const query = this.repository
      .createQueryBuilder('space')
      .where('space.buildingId = :buildingId', { buildingId })
      .andWhere('space.currentSessionId IS NULL')
      .andWhere('space.allowedVehicleType = :vehicleType', { vehicleType });

    if (!isResident) {
      query.andWhere('space.isForResidents = false');
    }

    return query.orderBy('space.floor', 'ASC').addOrderBy('space.number', 'ASC').getOne();
  }

  async update(space: ParkingSpace): Promise<ParkingSpace> {
    return this.repository.save(space);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
