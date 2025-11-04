import { ApiProperty } from '@nestjs/swagger';

export class CheckOutResponseDto {
  @ApiProperty({
    description: 'Session length in hours (decimal, e.g., 2.5 for 2 hours and 30 minutes)',
    example: 2.5,
    type: Number,
  })
  sessionLengthInHoursMinutes: number;

  @ApiProperty({
    description: 'ID of the parking space that was released',
    example: 45,
    type: Number,
  })
  parkingSpaceId: number;

  @ApiProperty({
    description: 'Calculated total charge for the parking session',
    example: 12.5,
    type: Number,
  })
  calculatedCharge: number;

  @ApiProperty({
    description: 'Hourly rate applied to this session',
    example: 5.0,
    type: Number,
  })
  fee: number;
}
