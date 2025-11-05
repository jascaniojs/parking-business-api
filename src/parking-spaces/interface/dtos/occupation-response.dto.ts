import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '../../domain/vehicle-type.enum';
import { ParkingSpace } from '../../domain/parking-space.entity';

export class OccupationResponseDto {
  @ApiProperty({
    description: 'ID of the parking space',
    example: 45,
    type: Number,
  })
  parkingSpaceId: number;

  @ApiProperty({
    description: 'Parking space number',
    example: 45,
    type: Number,
  })
  number: number;

  @ApiProperty({
    description:
      'Type of vehicle allowed in this space. Null for resident-only spaces when vacant. Shows actual vehicle type when occupied.',
    example: VehicleType.CAR,
    enum: VehicleType,
    nullable: true,
  })
  vehicleType: VehicleType | null;

  @ApiProperty({
    description: 'Whether the parking space is currently occupied',
    example: true,
    type: Boolean,
  })
  isOccupied: boolean;

  @ApiProperty({
    description: 'Whether the parking space is designated for residents only',
    example: false,
    type: Boolean,
  })
  isResident: boolean;

  @ApiProperty({
    description: 'Floor number',
    example: 1,
    type: Number,
  })
  floor: number;

  static fromEntity(space: ParkingSpace): OccupationResponseDto {
    const isOccupied = !space.isAvailable();
    let vehicleType: VehicleType | null;

    if (isOccupied && space.currentSession) {
      vehicleType = space.currentSession.vehicleType;
    } else if (space.isForResidents) {
      vehicleType = null;
    } else {
      vehicleType = space.allowedVehicleType;
    }

    return {
      parkingSpaceId: space.id,
      number: space.number,
      vehicleType,
      isOccupied,
      isResident: space.isForResidents,
      floor: space.floor,
    };
  }
}
