import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ParkingSessionsService } from '../domain/parking-sessions.service';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckInResponseDto } from './dtos/check-in-response.dto';

@ApiTags('parking-sessions')
@ApiBearerAuth('JWT')
@Controller('parking-sessions')
export class ParkingSessionsController {
  constructor(private readonly parkingSessionsService: ParkingSessionsService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Check in to a parking space',
    description:
      'Creates a new parking session by assigning an available parking space based on vehicle type and resident status.',
  })
  @ApiResponse({
    status: 201,
    description: 'Parking session created successfully',
    type: CheckInResponseDto,
  })
  @ApiConflictResponse({
    description: 'No empty spaces available',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'No empty spaces available.' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error creating parking session',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error creating parking session.' },
      },
    },
  })
  async checkIn(@Body() checkInDto: CheckInDto): Promise<CheckInResponseDto> {
    return this.parkingSessionsService.checkIn(checkInDto);
  }
}
