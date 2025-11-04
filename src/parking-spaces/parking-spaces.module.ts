import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSpace } from './domain/parking-space.entity';
import { Building } from '../buildings/domain/building.entity';
import { ParkingSpaceRepository } from './infrastructure/parking-space.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSpace, Building])],
  providers: [ParkingSpaceRepository],
  exports: [ParkingSpaceRepository],
})
export class ParkingSpacesModule {}
