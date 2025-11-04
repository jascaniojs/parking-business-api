import { Injectable } from '@nestjs/common';
import { ParkingSpaceRepository } from '../infrastructure/parking-space.repository';
import { OccupationResponseDto } from '../interface/dtos/occupation-response.dto';
import { VehicleType } from './vehicle-type.enum';

@Injectable()
export class ParkingSpacesService {
  constructor(
    private readonly parkingSpaceRepository: ParkingSpaceRepository,
  ) {}

  async getOccupation(): Promise<OccupationResponseDto[]> {
    const spaces = await this.parkingSpaceRepository.findAllWithSessions();

    return spaces.map((space) => {
      const isOccupied = !space.isAvailable();

      // Determine vehicleType based on business rules
      let vehicleType: VehicleType | null;

      if (isOccupied && space.currentSession) {
        // When occupied: show actual vehicle type from session
        vehicleType = space.currentSession.vehicleType;
      } else if (space.isForResidents) {
        // Resident-only space when vacant: null
        vehicleType = null;
      } else {
        // Non-resident space when vacant: show allowed vehicle type
        vehicleType = space.allowedVehicleType;
      }

      return {
        parkingSpaceId: space.id,
        number: space.number,
        vehicleType,
        isOccupied,
        isResident: space.isForResidents,
      };
    });
  }
}
