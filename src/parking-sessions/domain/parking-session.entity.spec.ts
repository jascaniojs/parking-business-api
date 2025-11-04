import { ParkingSession } from './parking-session.entity';
import { VehicleType } from '../../parking-spaces/domain/vehicle-type.enum';

describe('ParkingSession Entity', () => {
  describe('create', () => {
    it('should create a parking session with valid data', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);

      expect(session).toBeInstanceOf(ParkingSession);
      expect(session.parkingSpaceId).toBe(1);
      expect(session.vehicleType).toBe(VehicleType.CAR);
      expect(session.isResident).toBe(false);
      expect(session.ratePerHour).toBe(5.0);
      expect(session.checkInAt).toBeInstanceOf(Date);
      expect(session.checkOutAt).toBeNull();
      expect(session.calculatedCharge).toBeNull();
    });

    it('should create a resident parking session with zero rate', () => {
      const session = ParkingSession.create(1, VehicleType.MOTORCYCLE, true, 0);

      expect(session.isResident).toBe(true);
      expect(session.ratePerHour).toBe(0);
    });

    it('should throw error when vehicle type is invalid', () => {
      expect(() => {
        ParkingSession.create(1, 'BUS' as VehicleType, false, 5.0);
      }).toThrow('Invalid vehicle type');
    });

    it('should throw error when ratePerHour is negative', () => {
      expect(() => {
        ParkingSession.create(1, VehicleType.CAR, false, -5.0);
      }).toThrow('Rate per hour must be non-negative');
    });

    it('should allow ratePerHour to be 0', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, true, 0);

      expect(session.ratePerHour).toBe(0);
    });
  });

  describe('isActive', () => {
    it('should return true when checkOutAt is null', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);

      expect(session.isActive()).toBe(true);
    });

    it('should return false when checkOutAt is set', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkOutAt = new Date();

      expect(session.isActive()).toBe(false);
    });
  });

  describe('getDurationInHours', () => {
    it('should calculate duration and round up to full hours', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-01T11:30:00Z'); // 1.5 hours

      const duration = session.getDurationInHours();

      expect(duration).toBe(2); // Rounds up to 2 hours
    });

    it('should return 1 hour for exactly 1 hour duration', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-01T11:00:00Z');

      const duration = session.getDurationInHours();

      expect(duration).toBe(1);
    });

    it('should round up partial minutes to full hour', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-01T10:01:00Z'); // 1 minute

      const duration = session.getDurationInHours();

      expect(duration).toBe(1); // Rounds up to 1 hour
    });

    it('should use current time when checkOutAt is null', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt =  new Date(Date.now() - 3600000);

      const duration = session.getDurationInHours();

      expect(duration).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateCharge', () => {
    it('should return 0 for residents', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, true, 0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-01T15:00:00Z'); // 5 hours

      const charge = session.calculateCharge();

      expect(charge).toBe(0);
    });

    it('should calculate charge correctly for non-residents', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-01T12:00:00Z'); // 2 hours

      const charge = session.calculateCharge();

      expect(charge).toBe(10.0); // 2 * 5.0
    });

    it('should round charge to 2 decimal places', () => {
      const session = ParkingSession.create(1, VehicleType.MOTORCYCLE, false, 3.33);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');

      const charge = session.calculateCharge();

      expect(charge).toBe(9.99); // 3 * 3.33 = 9.99
    });

    it('should handle partial hours by rounding up duration', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-01T10:30:00Z'); // 0.5 hours

      const charge = session.calculateCharge();

      expect(charge).toBe(5.0); // Rounds up to 1 hour * 5.0
    });

    it('should calculate charge for a full day parking (24 hours)', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date('2024-01-01T10:00:00Z');
      session.checkOutAt = new Date('2024-01-02T10:00:00Z'); // 24 hours

      const charge = session.calculateCharge();

      expect(charge).toBe(120.0); // 24 * 5.0
    });
  });

  describe('checkOut', () => {
    it('should set checkOutAt and calculate charge', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date(Date.now() - 7200000); // 2 hours ago

      session.checkOut();

      expect(session.checkOutAt).toBeInstanceOf(Date);
      expect(session.calculatedCharge).toBeGreaterThanOrEqual(10.0);
      expect(session.isActive()).toBe(false);
    });

    it('should throw error when session is already checked out', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, false, 5.0);
      session.checkInAt = new Date(Date.now() - 3600000);
      session.checkOut();

      expect(() => {
        session.checkOut();
      }).toThrow('Cannot check out: session is not active');
    });

    it('should calculate zero charge for residents on checkout', () => {
      const session = ParkingSession.create(1, VehicleType.CAR, true, 0);
      session.checkInAt = new Date(Date.now() - 7200000); // 2 hours ago

      session.checkOut();

      expect(session.calculatedCharge).toBe(0);
    });
  });
});
