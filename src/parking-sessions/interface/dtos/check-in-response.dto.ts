import { ApiProperty } from '@nestjs/swagger';

export class CheckInResponseDto {
  @ApiProperty({
    description: 'ID of the created parking session',
    example: 123,
    type: Number,
  })
  parkingSessionId: number;

  @ApiProperty({
    description: 'ID of the assigned parking space',
    example: 45,
    type: Number,
  })
  parkingSpaceId: number;
}
