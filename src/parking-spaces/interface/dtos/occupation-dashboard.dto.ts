import { OccupationResponseDto } from './occupation-response.dto';
import { Price } from '../../../prices/domain/price.entity';
import { VehicleType } from '../../domain/vehicle-type.enum';

export interface DashboardSpotDto {
  isSpot: true;
  id: string;
  status: 'available' | 'occupied';
  residential?: boolean;
  vehicle?: 'car' | 'motorcycle';
}

export interface DashboardAisleDto {
  isAisle: true;
}

export interface DashboardStreetDto {
  isStreet: true;
}

export type DashboardRowItem = DashboardSpotDto | DashboardAisleDto | DashboardStreetDto;

export interface DashboardFloorDto {
  name: string;
  rows: DashboardRowItem[][];
}

export interface DashboardStatsDto {
  residential: number;
  paidCar: number;
  paidMotorcycle: number;
}

export interface DashboardFeeDto {
  car: number;
  motorcycle: number;
}

export class DashboardResponseDto {
  pageTitle: string;
  stats: DashboardStatsDto;
  fee: DashboardFeeDto;
  floors: DashboardFloorDto[];

  static fromOccupationData(
    occupation: OccupationResponseDto[],
    prices: Price[],
    buildingName: string,
  ): DashboardResponseDto {
    const stats = this.calculateStats(occupation);
    const fee = this.extractFees(prices);
    const floors = this.groupAndTransformFloors(occupation);

    return {
      pageTitle: buildingName,
      stats,
      fee,
      floors,
    };
  }

  private static calculateStats(occupation: OccupationResponseDto[]): DashboardStatsDto {
    const residential = occupation.filter((s) => s.isResident && !s.isOccupied).length;
    const paidCar = occupation.filter(
      (s) => !s.isResident && s.vehicleType === VehicleType.CAR && !s.isOccupied,
    ).length;
    const paidMotorcycle = occupation.filter(
      (s) => !s.isResident && s.vehicleType === VehicleType.MOTORCYCLE && !s.isOccupied,
    ).length;

    return { residential, paidCar, paidMotorcycle };
  }

  private static extractFees(prices: Price[]): DashboardFeeDto {
    const carPrice = prices.find((p) => p.vehicleType === VehicleType.CAR);
    const motorcyclePrice = prices.find((p) => p.vehicleType === VehicleType.MOTORCYCLE);

    return {
      car: carPrice ? Number(carPrice.ratePerHour) : 0,
      motorcycle: motorcyclePrice ? Number(motorcyclePrice.ratePerHour) : 0,
    };
  }

  private static groupAndTransformFloors(occupation: OccupationResponseDto[]): DashboardFloorDto[] {
    const floorMap = new Map<number, OccupationResponseDto[]>();
    occupation.forEach((space) => {
      if (!floorMap.has(space.floor)) {
        floorMap.set(space.floor, []);
      }
      floorMap.get(space.floor)!.push(space);
    });

    const floors: DashboardFloorDto[] = [];
    const sortedFloors = Array.from(floorMap.keys()).sort((a, b) => a - b);

    for (const floorNumber of sortedFloors) {
      const spaces = floorMap.get(floorNumber)!;
      const sortedSpaces = spaces.sort((a, b) => a.number - b.number);
      const rows = this.buildFloorRows(sortedSpaces);

      floors.push({
        name: `Floor ${floorNumber}`,
        rows,
      });
    }

    return floors;
  }

  private static buildFloorRows(spaces: OccupationResponseDto[]): DashboardRowItem[][] {
    const rows: DashboardRowItem[][] = [];
    let currentRow: DashboardRowItem[] = [];
    let spacesInRow = 0;

    for (const space of spaces) {
      // Add aisle separator every 5 spaces
      if (spacesInRow > 0 && spacesInRow % 5 === 0) {
        currentRow.push({ isAisle: true });
      }

      const spot = this.buildSpot(space);
      currentRow.push(spot);
      spacesInRow++;

      // Add street separator every 15 spaces
      if (spacesInRow % 15 === 0) {
        rows.push(currentRow);
        rows.push([{ isStreet: true }]);
        currentRow = [];
        spacesInRow = 0;
      }
    }

    // Add remaining spots
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  private static buildSpot(space: OccupationResponseDto): DashboardSpotDto {
    const spot: DashboardSpotDto = {
      isSpot: true,
      id: `#${space.number}`,
      status: space.isOccupied ? 'occupied' : 'available',
    };

    if (space.isResident) {
      spot.residential = true;
      // Only add vehicle for residential spaces if occupied
      if (space.isOccupied && space.vehicleType) {
        spot.vehicle = space.vehicleType === VehicleType.CAR ? 'car' : 'motorcycle';
      }
    } else {
      // Non-residential spaces always have vehicle type
      if (space.vehicleType) {
        spot.vehicle = space.vehicleType === VehicleType.CAR ? 'car' : 'motorcycle';
      }
    }

    return spot;
  }
}
