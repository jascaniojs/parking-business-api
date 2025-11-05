import { OccupationResponseDto } from './occupation-response.dto';
import { ParkingSpace } from '../../domain/parking-space.entity';
import { VehicleType } from '../../domain/vehicle-type.enum';
import { ParkingSession } from '../../../parking-sessions/domain/parking-session.entity';

describe('OccupationResponseDto', () => {
  describe('fromEntity', () => {
    it('should map occupied space with CAR session', () => {
      // Arrange
      const space = ParkingSpace.create(1, 2, 45, VehicleType.CAR, false);
      space.id = 45;
      space.occupy('550e8400-e29b-41d4-a716-446655440000');

      const session = new ParkingSession();
      session.vehicleType = VehicleType.CAR;
      space.currentSession = session;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.parkingSpaceId).toBe(45);
      expect(dto.number).toBe(45);
      expect(dto.vehicleType).toBe(VehicleType.CAR);
      expect(dto.isOccupied).toBe(true);
      expect(dto.isResident).toBe(false);
      expect(dto.floor).toBe(2);
    });

    it('should map occupied space with MOTORCYCLE session', () => {
      // Arrange
      const space = ParkingSpace.create(1, 2, 131, VehicleType.MOTORCYCLE, false);
      space.id = 131;
      space.occupy('650e8400-e29b-41d4-a716-446655440001');

      const session = new ParkingSession();
      session.vehicleType = VehicleType.MOTORCYCLE;
      space.currentSession = session;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.parkingSpaceId).toBe(131);
      expect(dto.number).toBe(131);
      expect(dto.vehicleType).toBe(VehicleType.MOTORCYCLE);
      expect(dto.isOccupied).toBe(true);
      expect(dto.isResident).toBe(false);
      expect(dto.floor).toBe(2);
    });

    it('should map vacant resident space with null vehicle type', () => {
      // Arrange
      const space = ParkingSpace.create(1, 1, 10, null, true);
      space.id = 10;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.parkingSpaceId).toBe(10);
      expect(dto.number).toBe(10);
      expect(dto.vehicleType).toBeNull();
      expect(dto.isOccupied).toBe(false);
      expect(dto.isResident).toBe(true);
      expect(dto.floor).toBe(1);
    });

    it('should map vacant non-resident CAR space with allowed vehicle type', () => {
      // Arrange
      const space = ParkingSpace.create(1, 1, 75, VehicleType.CAR, false);
      space.id = 75;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.parkingSpaceId).toBe(75);
      expect(dto.number).toBe(75);
      expect(dto.vehicleType).toBe(VehicleType.CAR);
      expect(dto.isOccupied).toBe(false);
      expect(dto.isResident).toBe(false);
      expect(dto.floor).toBe(1);
    });

    it('should map vacant non-resident MOTORCYCLE space with allowed vehicle type', () => {
      // Arrange
      const space = ParkingSpace.create(1, 2, 145, VehicleType.MOTORCYCLE, false);
      space.id = 145;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.parkingSpaceId).toBe(145);
      expect(dto.number).toBe(145);
      expect(dto.vehicleType).toBe(VehicleType.MOTORCYCLE);
      expect(dto.isOccupied).toBe(false);
      expect(dto.isResident).toBe(false);
      expect(dto.floor).toBe(2);
    });

    it('should map occupied resident space with session vehicle type', () => {
      // Arrange
      const space = ParkingSpace.create(1, 1, 25, null, true);
      space.id = 25;
      space.occupy('750e8400-e29b-41d4-a716-446655440002');

      const session = new ParkingSession();
      session.vehicleType = VehicleType.CAR;
      space.currentSession = session;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.parkingSpaceId).toBe(25);
      expect(dto.number).toBe(25);
      expect(dto.vehicleType).toBe(VehicleType.CAR);
      expect(dto.isOccupied).toBe(true);
      expect(dto.isResident).toBe(true);
      expect(dto.floor).toBe(1);
    });

    it('should correctly identify space as occupied when currentSessionId exists', () => {
      // Arrange
      const space = ParkingSpace.create(1, 1, 50, VehicleType.CAR, false);
      space.id = 50;
      space.occupy('850e8400-e29b-41d4-a716-446655440003');

      const session = new ParkingSession();
      session.vehicleType = VehicleType.CAR;
      space.currentSession = session;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.isOccupied).toBe(true);
    });

    it('should correctly identify space as available when currentSessionId is null', () => {
      // Arrange
      const space = ParkingSpace.create(1, 2, 100, VehicleType.CAR, false);
      space.id = 100;

      // Act
      const dto = OccupationResponseDto.fromEntity(space);

      // Assert
      expect(dto.isOccupied).toBe(false);
    });
  });
});
