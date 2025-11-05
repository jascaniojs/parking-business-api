import { HistoryResponseDto } from './history-response.dto';
import { ParkingSession } from '../../domain/parking-session.entity';
import { VehicleType } from '../../../parking-spaces/domain/vehicle-type.enum';

describe('HistoryResponseDto', () => {
  describe('fromEntity', () => {
    it('should map completed session to DTO correctly', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:30:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T13:00:00Z');
      session.calculatedCharge = 12.5;

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.parkingSpaceId).toBe(45);
      expect(dto.checkedInAt).toEqual(new Date('2024-01-15T10:30:00Z'));
      expect(dto.checkedOutAt).toEqual(new Date('2024-01-15T13:00:00Z'));
      expect(dto.ratePerHour).toBe(5.0);
      expect(dto.totalCharge).toBe(12.5);
    });

    it('should format session length correctly for whole hours', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T12:00:00Z');

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.sessionLength).toBe('02h 00m');
    });

    it('should format session length correctly for hours with minutes', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:30:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T13:00:00Z');

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.sessionLength).toBe('02h 30m');
    });

    it('should format session length correctly for less than 1 hour', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T10:45:00Z');

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.sessionLength).toBe('00h 45m');
    });

    it('should format session length with leading zeros', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T10:05:00Z');

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.sessionLength).toBe('00h 05m');
    });

    it('should handle long parking sessions correctly', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T08:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T20:30:00Z');

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.sessionLength).toBe('12h 30m');
    });

    it('should handle motorcycle sessions correctly', () => {
      const session = ParkingSession.create(131, VehicleType.MOTORCYCLE, false, 3.0);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T11:30:00Z');
      session.calculatedCharge = 4.5;

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.parkingSpaceId).toBe(131);
      expect(dto.ratePerHour).toBe(3.0);
      expect(dto.totalCharge).toBe(4.5);
      expect(dto.sessionLength).toBe('01h 30m');
    });

    it('should throw error for active sessions without checkOutAt', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      // No checkout

      expect(() => HistoryResponseDto.fromEntity(session)).toThrow(
        'Cannot create history response from active session',
      );
    });

    it('should handle decimal rate per hour correctly', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.5);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T12:00:00Z');
      session.calculatedCharge = 11.0;

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.ratePerHour).toBe(5.5);
      expect(dto.totalCharge).toBe(11.0);
    });

    it('should handle decimal charge correctly', () => {
      const session = ParkingSession.create(45, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-15T10:00:00Z');
      session.checkOut();
      session.checkOutAt = new Date('2024-01-15T10:45:00Z');
      session.calculatedCharge = 3.75;

      const dto = HistoryResponseDto.fromEntity(session);

      expect(dto.totalCharge).toBe(3.75);
    });
  });
});
