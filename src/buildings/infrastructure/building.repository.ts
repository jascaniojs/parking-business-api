import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from '../domain/building.entity';

@Injectable()
export class BuildingRepository {
  constructor(
    @InjectRepository(Building)
    private readonly repository: Repository<Building>,
  ) {}

  async save(building: Building): Promise<Building> {
    return this.repository.save(building);
  }

  async findById(id: number): Promise<Building | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Building[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
