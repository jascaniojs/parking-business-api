import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckOutDto {
  @ApiProperty({
    description: 'ID of the parking session to check out',
    example: 123,
    type: Number,
  })
  @IsNumber({}, { message: 'parkingSessionId must be a valid number' })
  @IsPositive({ message: 'parkingSessionId must be a positive number' })
  @IsNotEmpty({ message: 'parkingSessionId is required' })
  parkingSessionId: number;

  @ApiProperty({
    description: 'Whether the driver is a resident (must match the session)',
    example: false,
    type: Boolean,
  })
  @IsBoolean({ message: 'isResident must be a boolean value (true or false)' })
  @IsNotEmpty({ message: 'isResident is required' })
  isResident: boolean;
}
