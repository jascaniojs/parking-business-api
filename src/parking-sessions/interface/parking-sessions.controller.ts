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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingSessionsService } from '../domain/parking-sessions.service';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckInResponseDto } from './dtos/check-in-response.dto';
import { CheckOutDto } from './dtos/check-out.dto';
import { CheckOutResponseDto } from './dtos/check-out-response.dto';
import { HistoryQueryDto } from './dtos/history-query.dto';
import { PaginatedHistoryResponseDto } from './dtos/paginated-history-response.dto';
import { AdminGuard } from '../../auth/interface/guards/admin.guard';
import { ApiDescription } from '../../shared/decorators/swagger/api-description.decorator';

@ApiTags('parking-sessions')
@ApiBearerAuth('JWT')
@Controller('parking-sessions')
export class ParkingSessionsController {
  constructor(private readonly parkingSessionsService: ParkingSessionsService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiDescription({
    operation: {
      summary: 'Check in to a parking space',
      description:
        'Creates a new parking session by assigning an available parking space based on vehicle type and resident status.',
    },
    success: {
      status: 201,
      type: CheckInResponseDto,
      description: 'Parking session created successfully',
    },
    errors: {
      409: 'No empty spaces available.',
      500: 'Error creating parking session.',
    },
  })
  async checkIn(@Body() checkInDto: CheckInDto): Promise<CheckInResponseDto> {
    return this.parkingSessionsService.checkIn(checkInDto);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.CREATED)
  @ApiDescription({
    operation: {
      summary: 'Check out from a parking space',
      description:
        'Finishes a parking session, calculates the charge, and releases the parking space.',
    },
    success: {
      status: 201,
      type: CheckOutResponseDto,
      description: 'Parking session finished successfully',
    },
    errors: {
      400: 'Parking session is already finished.',
      404: 'Parking session not found.',
      422: 'Invalid isResident value. Session is for residents.',
      500: 'Error finishing parking session.',
    },
  })
  async checkOut(@Body() checkOutDto: CheckOutDto): Promise<CheckOutResponseDto> {
    return this.parkingSessionsService.checkOut(checkOutDto);
  }

  @Get('history')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiDescription({
    operation: {
      summary: 'Get parking session history (Admin only)',
      description:
        'Retrieves completed non-resident parking sessions with pagination and optional filters. Requires admin privileges.',
    },
    success: {
      status: 200,
      type: PaginatedHistoryResponseDto,
      description: 'Parking session history retrieved successfully',
    },
    errors: {
      403: 'Access denied. Admin privileges required.',
      500: 'Error retrieving parking session history.',
    },
  })
  async getHistory(@Query() queryDto: HistoryQueryDto): Promise<PaginatedHistoryResponseDto> {
    return this.parkingSessionsService.getHistory(queryDto);
  }
}
