import { Price } from './price.entity';
import { VehicleType } from '../../parking-spaces/domain/vehicle-type.enum';

describe('Price Entity', () => {
  describe('create', () => {
    it('should create a price with valid data for CAR', () => {
      const price = Price.create(1, VehicleType.CAR, 5.0);

      expect(price).toBeInstanceOf(Price);
      expect(price.buildingId).toBe(1);
      expect(price.vehicleType).toBe(VehicleType.CAR);
      expect(price.ratePerHour).toBe(5.0);
    });

    it('should create a price with valid data for MOTORCYCLE', () => {
      const price = Price.create(1, VehicleType.MOTORCYCLE, 3.0);

      expect(price).toBeInstanceOf(Price);
      expect(price.vehicleType).toBe(VehicleType.MOTORCYCLE);
      expect(price.ratePerHour).toBe(3.0);
    });

    it('should allow zero rate per hour', () => {
      const price = Price.create(1, VehicleType.CAR, 0);

      expect(price.ratePerHour).toBe(0);
    });

    it('should allow decimal rate per hour', () => {
      const price = Price.create(1, VehicleType.CAR, 4.99);

      expect(price.ratePerHour).toBe(4.99);
    });
  });
});
