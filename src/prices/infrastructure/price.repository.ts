import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Price } from '../domain/price.entity';
import { VehicleType } from '../../parking-spaces/domain/vehicle-type.enum';

@Injectable()
export class PriceRepository {
  constructor(
    @InjectRepository(Price)
    private readonly repository: Repository<Price>,
  ) {}

  async save(price: Price): Promise<Price> {
    return this.repository.save(price);
  }

  async getBy(buildingId: number, vehicleType?: VehicleType): Promise<Price[]> {
    const where: FindOptionsWhere<Price> = { buildingId };

    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    return this.repository.find({ where });
  }
}
