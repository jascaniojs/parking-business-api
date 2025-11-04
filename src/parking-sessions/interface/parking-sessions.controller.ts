import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ParkingSessionsService } from '../domain/parking-sessions.service';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckInResponseDto } from './dtos/check-in-response.dto';
import { CheckOutDto } from './dtos/check-out.dto';
import { CheckOutResponseDto } from './dtos/check-out-response.dto';

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

  @Post('check-out')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Check out from a parking space',
    description:
      'Finishes a parking session, calculates the charge, and releases the parking space.',
  })
  @ApiResponse({
    status: 201,
    description: 'Parking session finished successfully',
    type: CheckOutResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Parking session not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Parking session not found.' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Session already finished or isResident mismatch',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Parking session is already finished.',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error finishing parking session',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error finishing parking session.' },
      },
    },
  })
  async checkOut(@Body() checkOutDto: CheckOutDto): Promise<CheckOutResponseDto> {
    return this.parkingSessionsService.checkOut(checkOutDto);
  }
}
