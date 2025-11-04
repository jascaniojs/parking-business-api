import { Building } from './building.entity';

describe('Building Entity', () => {
  describe('create', () => {
    it('should create a building with valid data', () => {
      const building = Building.create('Main Garage', '123 Main St', 5);

      expect(building).toBeInstanceOf(Building);
      expect(building.name).toBe('Main Garage');
      expect(building.address).toBe('123 Main St');
      expect(building.totalFloors).toBe(5);
    });

    it('should create a building with 1 floor (minimum)', () => {
      const building = Building.create('Small Garage', '456 Oak Ave', 1);

      expect(building).toBeInstanceOf(Building);
      expect(building.totalFloors).toBe(1);
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        Building.create('', '123 Main St', 5);
      }).toThrow('Building name is required');
    });

    it('should throw error when name is null', () => {
      expect(() => {
        Building.create(null as unknown as string, '123 Main St', 5);
      }).toThrow('Building name is required');
    });

    it('should throw error when name is undefined', () => {
      expect(() => {
        Building.create(undefined as unknown as string, '123 Main St', 5);
      }).toThrow('Building name is required');
    });

    it('should throw error when address is empty', () => {
      expect(() => {
        Building.create('Main Garage', '', 5);
      }).toThrow('Address is required');
    });

    it('should throw error when address is null', () => {
      expect(() => {
        Building.create('Main Garage', null as unknown as string, 5);
      }).toThrow('Address is required');
    });

    it('should throw error when address is undefined', () => {
      expect(() => {
        Building.create('Main Garage', undefined as unknown as string, 5);
      }).toThrow('Address is required');
    });

    it('should throw error when totalFloors is 0', () => {
      expect(() => {
        Building.create('Main Garage', '123 Main St', 0);
      }).toThrow('Building must have at least 1 floor');
    });

    it('should throw error when totalFloors is negative', () => {
      expect(() => {
        Building.create('Main Garage', '123 Main St', -5);
      }).toThrow('Building must have at least 1 floor');
    });

    it('should throw error when totalFloors is not an integer', () => {
      expect(() => {
        Building.create('Main Garage', '123 Main St', 5.5);
      }).toThrow('Building must have at least 1 floor');
    });
  });
});
