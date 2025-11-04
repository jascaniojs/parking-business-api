import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './domain/price.entity';
import { Building } from '../buildings/domain/building.entity';
import { PriceRepository } from './infrastructure/price.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Price, Building])],
  providers: [PriceRepository],
  exports: [PriceRepository],
})
export class PricesModule {}
