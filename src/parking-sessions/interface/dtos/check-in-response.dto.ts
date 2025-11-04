import { ApiProperty } from '@nestjs/swagger';

export class CheckInResponseDto {
  @ApiProperty({
    description: 'ID of the created parking session',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  parkingSessionId: string;

  @ApiProperty({
    description: 'ID of the assigned parking space',
    example: 45,
    type: Number,
  })
  parkingSpaceId: number;
}
