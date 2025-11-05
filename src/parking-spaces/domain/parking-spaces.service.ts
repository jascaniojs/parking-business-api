import { Injectable, NotFoundException } from '@nestjs/common';
import { ParkingSpaceRepository } from '../infrastructure/parking-space.repository';
import { OccupationResponseDto } from '../interface/dtos/occupation-response.dto';
import { DashboardResponseDto } from '../interface/dtos/occupation-dashboard.dto';
import { PriceRepository } from '../../prices/infrastructure/price.repository';
import { BuildingRepository } from '../../buildings/infrastructure/building.repository';

@Injectable()
export class ParkingSpacesService {
  constructor(
    private readonly parkingSpaceRepository: ParkingSpaceRepository,
    private readonly priceRepository: PriceRepository,
    private readonly buildingRepository: BuildingRepository,
  ) {}

  async getOccupation(): Promise<OccupationResponseDto[]> {
    const spaces = await this.parkingSpaceRepository.findAllWithSessions();
    return spaces.map((space) => OccupationResponseDto.fromEntity(space));
  }

  async getDashboardData(buildingId: number): Promise<DashboardResponseDto> {
    // Fetch building
    const building = await this.buildingRepository.findById(buildingId);
    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }

    // Fetch occupation data
    const occupation = await this.getOccupation();

    // Fetch pricing data
    const prices = await this.priceRepository.getBy(buildingId);

    // Use DTO mapper to transform data
    return DashboardResponseDto.fromOccupationData(occupation, prices, building.name);
  }
}
