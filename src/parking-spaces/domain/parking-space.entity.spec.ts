import { ParkingSpace } from './parking-space.entity';
import { VehicleType } from './vehicle-type.enum';

describe('ParkingSpace Entity', () => {
  describe('create', () => {
    it('should create a parking space with valid data', () => {
      const space = ParkingSpace.create(1, 2, 45, VehicleType.CAR, false);

      expect(space).toBeInstanceOf(ParkingSpace);
      expect(space.buildingId).toBe(1);
      expect(space.floor).toBe(2);
      expect(space.number).toBe(45);
      expect(space.allowedVehicleType).toBe(VehicleType.CAR);
      expect(space.isForResidents).toBe(false);
      expect(space.currentSessionId).toBeNull();
    });

    it('should create a resident parking space', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR, true);

      expect(space.isForResidents).toBe(true);
    });

    it('should create a parking space with null vehicle type', () => {
      const space = ParkingSpace.create(1, 1, 10, null, true);

      expect(space.allowedVehicleType).toBeNull();
    });

    it('should default isForResidents to false when not provided', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);

      expect(space.isForResidents).toBe(false);
    });

    it('should throw error when buildingId is 0', () => {
      expect(() => {
        ParkingSpace.create(0, 1, 10, VehicleType.CAR);
      }).toThrow('Building ID is required');
    });

    it('should throw error when floor is 0', () => {
      expect(() => {
        ParkingSpace.create(1, 0, 10, VehicleType.CAR);
      }).toThrow('Floor must be at least 1');
    });

    it('should throw error when floor is negative', () => {
      expect(() => {
        ParkingSpace.create(1, -2, 10, VehicleType.CAR);
      }).toThrow('Floor must be at least 1');
    });

    it('should throw error when floor is not an integer', () => {
      expect(() => {
        ParkingSpace.create(1, 2.5, 10, VehicleType.CAR);
      }).toThrow('Floor must be at least 1');
    });

    it('should throw error when number is 0', () => {
      expect(() => {
        ParkingSpace.create(1, 1, 0, VehicleType.CAR);
      }).toThrow('Space number must be at least 1');
    });

    it('should throw error when number is negative', () => {
      expect(() => {
        ParkingSpace.create(1, 1, -5, VehicleType.CAR);
      }).toThrow('Space number must be at least 1');
    });

    it('should throw error when number is not an integer', () => {
      expect(() => {
        ParkingSpace.create(1, 1, 10.5, VehicleType.CAR);
      }).toThrow('Space number must be at least 1');
    });

    it('should throw error when vehicle type is invalid', () => {
      expect(() => {
        ParkingSpace.create(1, 1, 10, 'TRUCK' as VehicleType);
      }).toThrow('Invalid vehicle type');
    });
  });

  describe('isAvailable', () => {
    it('should return true when currentSessionId is null', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);

      expect(space.isAvailable()).toBe(true);
    });

    it('should return false when currentSessionId is set', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);
      space.currentSessionId = 123;

      expect(space.isAvailable()).toBe(false);
    });
  });

  describe('occupy', () => {
    it('should set currentSessionId when space is available', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);

      space.occupy(456);

      expect(space.currentSessionId).toBe(456);
      expect(space.isAvailable()).toBe(false);
    });

    it('should throw error when space is already occupied', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);
      space.occupy(123);

      expect(() => {
        space.occupy(456);
      }).toThrow('Parking space Floor 1 - Space 10 is already occupied');
    });
  });

  describe('release', () => {
    it('should clear currentSessionId', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);
      space.occupy(123);

      space.release();

      expect(space.currentSessionId).toBeNull();
      expect(space.isAvailable()).toBe(true);
    });

    it('should work even when space is already available', () => {
      const space = ParkingSpace.create(1, 1, 10, VehicleType.CAR);

      space.release();

      expect(space.currentSessionId).toBeNull();
    });
  });

  describe('getSpaceCode', () => {
    it('should return formatted space code', () => {
      const space = ParkingSpace.create(1, 3, 25, VehicleType.CAR);

      expect(space.getSpaceCode()).toBe('Floor 3 - Space 25');
    });

    it('should return correct code for single digit floor and number', () => {
      const space = ParkingSpace.create(1, 1, 5, VehicleType.MOTORCYCLE);

      expect(space.getSpaceCode()).toBe('Floor 1 - Space 5');
    });
  });
});
