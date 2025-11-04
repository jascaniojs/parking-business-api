import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckOutDto {
  @ApiProperty({
    description: 'ID of the parking session to check out',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID('4', { message: 'parkingSessionId must be a valid UUID' })
  @IsNotEmpty({ message: 'parkingSessionId is required' })
  parkingSessionId: string;

  @ApiProperty({
    description: 'Whether the driver is a resident (must match the session)',
    example: false,
    type: Boolean,
  })
  @IsBoolean({ message: 'isResident must be a boolean value (true or false)' })
  @IsNotEmpty({ message: 'isResident is required' })
  isResident: boolean;
}
