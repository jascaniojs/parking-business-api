import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ParkingSessionsService } from '../domain/parking-sessions.service';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckInResponseDto } from './dtos/check-in-response.dto';
import { CheckOutDto } from './dtos/check-out.dto';
import { CheckOutResponseDto } from './dtos/check-out-response.dto';
import { HistoryQueryDto } from './dtos/history-query.dto';
import { PaginatedHistoryResponseDto } from './dtos/paginated-history-response.dto';
import { AdminGuard } from '../../auth/interface/guards/admin.guard';

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
    description: 'Session already finished',
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
  @ApiUnprocessableEntityResponse({
    description: 'isResident value does not match session',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 422 },
        message: {
          type: 'string',
          example: 'Invalid isResident value. Session is for residents.',
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

  @Get('history')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get parking session history (Admin only)',
    description:
      'Retrieves completed non-resident parking sessions with pagination and optional filters. Requires admin privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parking session history retrieved successfully',
    type: PaginatedHistoryResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Access denied. Admin privileges required.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Access denied. Admin privileges required.' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error retrieving parking session history',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error retrieving parking session history.' },
      },
    },
  })
  async getHistory(@Query() queryDto: HistoryQueryDto): Promise<PaginatedHistoryResponseDto> {
    return this.parkingSessionsService.getHistory(queryDto);
  }
}
