import { DashboardResponseDto, DashboardSpotDto } from './occupation-dashboard.dto';
import { OccupationResponseDto } from './occupation-response.dto';
import { Price } from '../../../prices/domain/price.entity';
import { VehicleType } from '../../domain/vehicle-type.enum';

describe('DashboardResponseDto', () => {
  describe('fromOccupationData', () => {
    let mockPrices: Price[];
    let occupation: OccupationResponseDto[];

    beforeEach(() => {
      mockPrices = [
        { id: 1, buildingId: 1, vehicleType: VehicleType.CAR, ratePerHour: 5.0 } as Price,
        { id: 2, buildingId: 1, vehicleType: VehicleType.MOTORCYCLE, ratePerHour: 3.0 } as Price,
      ];

      occupation = [
        // Residential spaces (floor 1, spaces 1-2)
        {
          parkingSpaceId: 1,
          number: 1,
          vehicleType: VehicleType.CAR,
          isOccupied: true,
          isResident: true,
          floor: 1,
        },
        {
          parkingSpaceId: 2,
          number: 2,
          vehicleType: null,
          isOccupied: false,
          isResident: true,
          floor: 1,
        },

        // Paid car spaces (floor 1, spaces 51-55)
        {
          parkingSpaceId: 51,
          number: 51,
          vehicleType: VehicleType.CAR,
          isOccupied: true,
          isResident: false,
          floor: 1,
        },
        {
          parkingSpaceId: 52,
          number: 52,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        },
        {
          parkingSpaceId: 53,
          number: 53,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        },

        // Paid motorcycle spaces (floor 2, spaces 131-133)
        {
          parkingSpaceId: 131,
          number: 131,
          vehicleType: VehicleType.MOTORCYCLE,
          isOccupied: true,
          isResident: false,
          floor: 2,
        },
        {
          parkingSpaceId: 132,
          number: 132,
          vehicleType: VehicleType.MOTORCYCLE,
          isOccupied: false,
          isResident: false,
          floor: 2,
        },
        {
          parkingSpaceId: 133,
          number: 133,
          vehicleType: VehicleType.MOTORCYCLE,
          isOccupied: false,
          isResident: false,
          floor: 2,
        },
      ];
    });

    it('should calculate available stats correctly', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      expect(result.stats.residential).toBe(1); // Space 2 available
      expect(result.stats.paidCar).toBe(2); // Spaces 52, 53 available
      expect(result.stats.paidMotorcycle).toBe(2); // Spaces 132, 133 available
    });

    it('should extract pricing fees correctly', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      expect(result.fee.car).toBe(5.0);
      expect(result.fee.motorcycle).toBe(3.0);
    });

    it('should set page title from building name', () => {
      const result = DashboardResponseDto.fromOccupationData(occupation, mockPrices, 'Main Garage');

      expect(result.pageTitle).toBe('Main Garage');
    });

    it('should group spaces by floor and sort floors ascending', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      expect(result.floors.length).toBe(2);
      expect(result.floors[0].name).toBe('Floor 1');
      expect(result.floors[1].name).toBe('Floor 2');
    });

    it('should sort spaces by number within each floor', () => {
      const unsortedOccupation: OccupationResponseDto[] = [
        {
          parkingSpaceId: 3,
          number: 15,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        },
        {
          parkingSpaceId: 1,
          number: 5,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        },
        {
          parkingSpaceId: 2,
          number: 10,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        },
      ];

      const result = DashboardResponseDto.fromOccupationData(
        unsortedOccupation,
        mockPrices,
        'Test Building',
      );

      const spots = result.floors[0].rows[0].filter(
        (item): item is DashboardSpotDto => (item as any).isSpot === true,
      );
      expect(spots[0].id).toBe('#5');
      expect(spots[1].id).toBe('#10');
      expect(spots[2].id).toBe('#15');
    });

    it('should insert aisle separator every 5 spaces', () => {
      const sixSpaces: OccupationResponseDto[] = [];
      for (let i = 1; i <= 6; i++) {
        sixSpaces.push({
          parkingSpaceId: i,
          number: i,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        });
      }

      const result = DashboardResponseDto.fromOccupationData(
        sixSpaces,
        mockPrices,
        'Test Building',
      );

      const row = result.floors[0].rows[0];
      // 5 spots + 1 aisle + 1 spot = 7 items
      expect(row.length).toBe(7);
      expect(row[5]).toHaveProperty('isAisle', true);
    });

    it('should insert street separator every 15 spaces', () => {
      const sixteenSpaces: OccupationResponseDto[] = [];
      for (let i = 1; i <= 16; i++) {
        sixteenSpaces.push({
          parkingSpaceId: i,
          number: i,
          vehicleType: VehicleType.CAR,
          isOccupied: false,
          isResident: false,
          floor: 1,
        });
      }

      const result = DashboardResponseDto.fromOccupationData(
        sixteenSpaces,
        mockPrices,
        'Test Building',
      );

      const floor1 = result.floors[0];
      // Should have at least 2 rows: first row with 15 spaces + street separator row
      expect(floor1.rows.length).toBeGreaterThan(1);
      expect(floor1.rows[1][0]).toHaveProperty('isStreet', true);
    });

    it('should map vehicle types to lowercase strings', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      const floor1Spots = result.floors[0].rows[0].filter(
        (item): item is DashboardSpotDto => (item as any).isSpot === true,
      );
      const floor2Spots = result.floors[1].rows[0].filter(
        (item): item is DashboardSpotDto => (item as any).isSpot === true,
      );

      const carSpot = floor1Spots.find((s) => s.id === '#51')!;
      const motorcycleSpot = floor2Spots.find((s) => s.id === '#131')!;

      expect(carSpot.vehicle).toBe('car');
      expect(motorcycleSpot.vehicle).toBe('motorcycle');
    });

    it('should include vehicle for non-residential spaces', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      const floor1Spots = result.floors[0].rows[0].filter(
        (item): item is DashboardSpotDto => (item as any).isSpot === true,
      );
      const vacantCarSpot = floor1Spots.find((s) => s.id === '#52')!;

      expect(vacantCarSpot.vehicle).toBe('car');
      expect(vacantCarSpot.status).toBe('available');
    });

    it('should NOT include vehicle for vacant residential spaces', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      const floor1Spots = result.floors[0].rows[0].filter(
        (item): item is DashboardSpotDto => (item as any).isSpot === true,
      );
      const vacantResidentialSpot = floor1Spots.find((s) => s.id === '#2')!;

      expect(vacantResidentialSpot.residential).toBe(true);
      expect(vacantResidentialSpot.vehicle).toBeUndefined();
      expect(vacantResidentialSpot.status).toBe('available');
    });

    it('should include vehicle for occupied residential spaces', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      const floor1Spots = result.floors[0].rows[0].filter(
        (item): item is DashboardSpotDto => (item as any).isSpot === true,
      );
      const occupiedResidentialSpot = floor1Spots.find((s) => s.id === '#1')!;

      expect(occupiedResidentialSpot.residential).toBe(true);
      expect(occupiedResidentialSpot.vehicle).toBe('car');
      expect(occupiedResidentialSpot.status).toBe('occupied');
    });

    it('should create complete dashboard structure', () => {
      const result = DashboardResponseDto.fromOccupationData(
        occupation,
        mockPrices,
        'Test Building',
      );

      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('fee');
      expect(result).toHaveProperty('floors');
      expect(result.stats).toHaveProperty('residential');
      expect(result.stats).toHaveProperty('paidCar');
      expect(result.stats).toHaveProperty('paidMotorcycle');
      expect(result.fee).toHaveProperty('car');
      expect(result.fee).toHaveProperty('motorcycle');
    });
  });
});
