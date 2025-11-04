import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '../../../parking-spaces/domain/vehicle-type.enum';

export class CheckInDto {
  @ApiProperty({
    description: 'ID of the building where the vehicle will park',
    example: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'buildingId must be a valid number' })
  @IsPositive({ message: 'buildingId must be a positive number' })
  @IsNotEmpty({ message: 'buildingId is required' })
  buildingId: number;

  @ApiProperty({
    description: 'Type of vehicle',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsEnum(VehicleType, {
    message: `vehicleType must be one of the following values: ${Object.values(VehicleType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'vehicleType is required' })
  vehicleType: VehicleType;

  @ApiProperty({
    description: 'Whether the driver is a resident',
    example: false,
    type: Boolean,
  })
  @IsBoolean({ message: 'isResident must be a boolean value (true or false)' })
  @IsNotEmpty({ message: 'isResident is required' })
  isResident: boolean;
}
