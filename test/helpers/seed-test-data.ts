import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User } from '../../src/auth/domain/user.entity';
import { Building } from '../../src/buildings/domain/building.entity';
import { ParkingSpace } from '../../src/parking-spaces/domain/parking-space.entity';
import { Price } from '../../src/prices/domain/price.entity';
import { VehicleType } from '../../src/parking-spaces/domain/vehicle-type.enum';

export interface TestSeedData {
  authToken: string;
  userId: string;
  buildingId: number;
  building: Building;
}

/**
 * Seeds test database with default parking business data
 *
 * Creates:
 * - 1 test user with JWT token
 * - 1 building (2 floors)
 * - Pricing: €5/hour for cars, €3/hour for motorcycles
 * - 10 resident spaces (1-10, floor 1)
 * - 10 car spaces (11-20, floor 1)
 * - 5 motorcycle spaces (21-25, floor 2)
 */
export async function seedTestData(dataSource: DataSource): Promise<TestSeedData> {
  const userRepository = dataSource.getRepository(User);
  const buildingRepository = dataSource.getRepository(Building);
  const priceRepository = dataSource.getRepository(Price);
  const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);

  // Create test user
  const user = User.create('test@parking.com', 'Test User');
  const savedUser = await userRepository.save(user);

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
  const authToken = jwt.sign({ sub: savedUser.id, email: savedUser.email }, jwtSecret, {
    expiresIn: '1h',
  });

  // Create building
  const building = Building.create('Test Building', '123 Test St', 2);
  const savedBuilding = await buildingRepository.save(building);

  // Create pricing rules
  const carPrice = Price.create(savedBuilding.id, VehicleType.CAR, 5.0);
  await priceRepository.save(carPrice);

  const motorcyclePrice = Price.create(savedBuilding.id, VehicleType.MOTORCYCLE, 3.0);
  await priceRepository.save(motorcyclePrice);

  // Create parking spaces
  // Spaces 1-10: Resident-only (no vehicle type restriction)
  for (let i = 1; i <= 10; i++) {
    const space = ParkingSpace.create(savedBuilding.id, 1, i, null, true);
    await parkingSpaceRepository.save(space);
  }

  // Spaces 11-20: Cars (non-resident)
  for (let i = 11; i <= 20; i++) {
    const space = ParkingSpace.create(savedBuilding.id, 1, i, VehicleType.CAR, false);
    await parkingSpaceRepository.save(space);
  }

  // Spaces 21-25: Motorcycles (non-resident)
  for (let i = 21; i <= 25; i++) {
    const space = ParkingSpace.create(savedBuilding.id, 2, i, VehicleType.MOTORCYCLE, false);
    await parkingSpaceRepository.save(space);
  }

  return {
    authToken,
    userId: savedUser.id,
    buildingId: savedBuilding.id,
    building: savedBuilding,
  };
}
