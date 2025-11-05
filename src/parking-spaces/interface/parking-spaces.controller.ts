import { Controller, Get, HttpCode, HttpStatus, Render, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingSpacesService } from '../domain/parking-spaces.service';
import { OccupationResponseDto } from './dtos/occupation-response.dto';
import { DashboardResponseDto } from './dtos/occupation-dashboard.dto';
import { Public } from '../../auth/interface/decorators/public.decorator';

@ApiTags('parking-spaces')
@ApiBearerAuth('JWT')
@Controller('parking-spaces')
export class ParkingSpacesController {
  constructor(private readonly parkingSpacesService: ParkingSpacesService) {}

  @Get('occupation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get occupation status of all parking spaces',
    description:
      'Returns all parking spaces with their current occupation details including vehicle type, availability, and resident status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parking spaces occupation retrieved successfully',
    type: [OccupationResponseDto],
  })
  async getOccupation(): Promise<OccupationResponseDto[]> {
    return this.parkingSpacesService.getOccupation();
  }

  @Get('dashboard/:buildingId')
  @Public()
  @Render('dashboard')
  async getDashboard(
    @Param('buildingId', ParseIntPipe) buildingId: number,
  ): Promise<DashboardResponseDto> {
    return this.parkingSpacesService.getDashboardData(buildingId);
  }
}
