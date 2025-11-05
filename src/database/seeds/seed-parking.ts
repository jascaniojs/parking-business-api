import { DataSource } from 'typeorm';
import { Building } from '../../buildings/domain/building.entity';
import { Price } from '../../prices/domain/price.entity';
import { ParkingSpace } from '../../parking-spaces/domain/parking-space.entity';
import { VehicleType } from '../../parking-spaces/domain/vehicle-type.enum';
import * as fs from 'fs';
import * as path from 'path';

interface SeedData {
  building: {
    name: string;
    address: string;
    totalFloors: number;
  };
  prices: Array<{
    vehicleType: string;
    ratePerHour: number;
  }>;
  parkingSpaces: Array<{
    range: [number, number];
    floor: number;
    isForResidents: boolean;
    allowedVehicleType: string | null;
  }>;
}

export async function seedParking(dataSource: DataSource) {
  const buildingRepository = dataSource.getRepository(Building);
  const priceRepository = dataSource.getRepository(Price);
  const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);

  // Read seed data from JSON file
  const seedDataPath = path.join(process.cwd(), 'initial-seed.json');
  const seedData: SeedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

  console.log('Creating building...');

  // Create building
  const building = Building.create(
    seedData.building.name,
    seedData.building.address,
    seedData.building.totalFloors,
  );
  const savedBuilding = await buildingRepository.save(building);
  console.log(`✅ Created building: ${savedBuilding.name} (ID: ${savedBuilding.id})`);

  console.log('\nCreating pricing rules...');

  // Create pricing rules
  for (const pricingData of seedData.prices) {
    const price = Price.create(
      savedBuilding.id,
      pricingData.vehicleType as VehicleType,
      pricingData.ratePerHour,
    );
    const savedPrice = await priceRepository.save(price);
    console.log(`✅ Created pricing: ${savedPrice.vehicleType} - €${savedPrice.ratePerHour}/hour`);
  }

  console.log('\nCreating parking spaces...');

  // Create parking spaces
  let totalSpaces = 0;
  for (const spaceConfig of seedData.parkingSpaces) {
    const [start, end] = spaceConfig.range;

    for (let number = start; number <= end; number++) {
      const parkingSpace = ParkingSpace.create(
        savedBuilding.id,
        spaceConfig.floor,
        number,
        spaceConfig.allowedVehicleType as VehicleType,
        spaceConfig.isForResidents,
      );

      await parkingSpaceRepository.save(parkingSpace);
      totalSpaces++;
    }

    const description = spaceConfig.isForResidents
      ? 'resident spaces'
      : `${spaceConfig.allowedVehicleType} spaces`;
    console.log(`✅ Created spaces ${start}-${end}: Floor ${spaceConfig.floor}, ${description}`);
  }

  console.log(`\n✅ Successfully created ${totalSpaces} parking spaces!`);
}
