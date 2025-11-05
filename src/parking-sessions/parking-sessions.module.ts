import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSession } from './domain/parking-session.entity';
import { ParkingSessionRepository } from './infrastructure/parking-session.repository';
import { ParkingSessionsService } from './domain/parking-sessions.service';
import { ParkingSessionsController } from './interface/parking-sessions.controller';
import { ParkingSpacesModule } from '../parking-spaces/parking-spaces.module';
import { PricesModule } from '../prices/prices.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSession]), ParkingSpacesModule, PricesModule],
  providers: [ParkingSessionRepository, ParkingSessionsService],
  controllers: [ParkingSessionsController],
  exports: [ParkingSessionRepository, ParkingSessionsService],
})
export class ParkingSessionsModule {}
