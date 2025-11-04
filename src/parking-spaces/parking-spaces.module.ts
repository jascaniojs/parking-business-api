import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSpace } from './domain/parking-space.entity';
import { Building } from '../buildings/domain/building.entity';
import { ParkingSession } from '../parking-sessions/domain/parking-session.entity';
import { ParkingSpaceRepository } from './infrastructure/parking-space.repository';
import { ParkingSpacesService } from './domain/parking-spaces.service';
import { ParkingSpacesController } from './interface/parking-spaces.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSpace, Building, ParkingSession])],
  controllers: [ParkingSpacesController],
  providers: [ParkingSpaceRepository, ParkingSpacesService],
  exports: [ParkingSpaceRepository],
})
export class ParkingSpacesModule {}
