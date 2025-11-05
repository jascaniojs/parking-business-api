import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { VehicleType } from '../src/parking-spaces/domain/vehicle-type.enum';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from './test-db-setup';
import { seedTestData, TestSeedData } from './helpers/seed-test-data';

describe('ParkingSpacesController - Occupation (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testData: TestSeedData;

  /**
   * Helper function to perform check-in and return session data
   */
  async function performCheckIn(
    vehicleType: VehicleType,
    isResident: boolean,
  ): Promise<{ parkingSessionId: string; parkingSpaceId: number }> {
    const response = await request(app.getHttpServer())
      .post('/parking-sessions/check-in')
      .set('Authorization', `Bearer ${testData.authToken}`)
      .send({
        buildingId: testData.buildingId,
        vehicleType,
        isResident,
      })
      .expect(201);

    return response.body;
  }

  beforeAll(async () => {
    // Setup test database with migrations
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation pipe as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);

    console.log('✅ Test application initialized');
  });

  beforeEach(async () => {
    await clearTestDatabase(dataSource);
    testData = await seedTestData(dataSource);
  });

  afterAll(async () => {
    // Clean up after all tests
    await clearTestDatabase(dataSource);
    await app.close();
    await teardownTestDatabase();
    console.log('✅ Test cleanup completed');
  });

  describe('GET /parking-spaces/occupation - Success Cases', () => {
    it('should return all parking spaces with occupation details', async () => {
      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Verify response is an array
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify response structure
      response.body.forEach((space: any) => {
        expect(space).toHaveProperty('parkingSpaceId');
        expect(space).toHaveProperty('number');
        expect(space).toHaveProperty('vehicleType');
        expect(space).toHaveProperty('isOccupied');
        expect(space).toHaveProperty('isResident');
        expect(typeof space.parkingSpaceId).toBe('number');
        expect(typeof space.number).toBe('number');
        expect(typeof space.isOccupied).toBe('boolean');
        expect(typeof space.isResident).toBe('boolean');
      });
    });

    it('should show all spaces as vacant when no check-ins have occurred', async () => {
      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // All spaces should be vacant
      response.body.forEach((space: any) => {
        expect(space.isOccupied).toBe(false);
      });
    });

    it('should show correct vehicle type for vacant resident-only spaces', async () => {
      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Find resident-only spaces (should be vacant and have null vehicleType)
      const residentSpaces = response.body.filter((space: any) => space.isResident === true);

      expect(residentSpaces.length).toBeGreaterThan(0);
      residentSpaces.forEach((space: any) => {
        expect(space.vehicleType).toBeNull();
        expect(space.isOccupied).toBe(false);
      });
    });

    it('should show correct vehicle type for vacant non-resident car spaces', async () => {
      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Find non-resident car spaces
      const carSpaces = response.body.filter(
        (space: any) => space.isResident === false && space.vehicleType === VehicleType.CAR,
      );

      expect(carSpaces.length).toBeGreaterThan(0);
      carSpaces.forEach((space: any) => {
        expect(space.vehicleType).toBe(VehicleType.CAR);
        expect(space.isOccupied).toBe(false);
      });
    });

    it('should show correct vehicle type for vacant non-resident motorcycle spaces', async () => {
      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Find non-resident motorcycle spaces
      const motorcycleSpaces = response.body.filter(
        (space: any) => space.isResident === false && space.vehicleType === VehicleType.MOTORCYCLE,
      );

      expect(motorcycleSpaces.length).toBeGreaterThan(0);
      motorcycleSpaces.forEach((space: any) => {
        expect(space.vehicleType).toBe(VehicleType.MOTORCYCLE);
        expect(space.isOccupied).toBe(false);
      });
    });

    it('should show occupied space after check-in with session vehicle type', async () => {
      // Check in a car
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Find the occupied space
      const occupiedSpace = response.body.find(
        (space: any) => space.parkingSpaceId === checkInResult.parkingSpaceId,
      );

      expect(occupiedSpace).toBeDefined();
      expect(occupiedSpace.isOccupied).toBe(true);
      expect(occupiedSpace.vehicleType).toBe(VehicleType.CAR);
      expect(occupiedSpace.isResident).toBe(false);
    });

    it('should show occupied resident space with session vehicle type', async () => {
      // Check in a resident with a motorcycle
      const checkInResult = await performCheckIn(VehicleType.MOTORCYCLE, true);

      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Find the occupied resident space
      const occupiedSpace = response.body.find(
        (space: any) => space.parkingSpaceId === checkInResult.parkingSpaceId,
      );

      expect(occupiedSpace).toBeDefined();
      expect(occupiedSpace.isOccupied).toBe(true);
      expect(occupiedSpace.vehicleType).toBe(VehicleType.MOTORCYCLE);
      expect(occupiedSpace.isResident).toBe(true);
    });

    it('should show multiple occupied spaces correctly', async () => {
      // Check in multiple vehicles
      const checkIn1 = await performCheckIn(VehicleType.CAR, false);
      const checkIn2 = await performCheckIn(VehicleType.MOTORCYCLE, false);
      const checkIn3 = await performCheckIn(VehicleType.CAR, true);

      const response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      // Find all occupied spaces
      const occupiedSpaces = response.body.filter((space: any) => space.isOccupied === true);

      expect(occupiedSpaces).toHaveLength(3);

      // Verify each occupied space
      const space1 = occupiedSpaces.find((s: any) => s.parkingSpaceId === checkIn1.parkingSpaceId);
      expect(space1.vehicleType).toBe(VehicleType.CAR);
      expect(space1.isResident).toBe(false);

      const space2 = occupiedSpaces.find((s: any) => s.parkingSpaceId === checkIn2.parkingSpaceId);
      expect(space2.vehicleType).toBe(VehicleType.MOTORCYCLE);
      expect(space2.isResident).toBe(false);

      const space3 = occupiedSpaces.find((s: any) => s.parkingSpaceId === checkIn3.parkingSpaceId);
      expect(space3.vehicleType).toBe(VehicleType.CAR);
      expect(space3.isResident).toBe(true);
    });

    it('should show space as vacant after check-out', async () => {
      // Check in a car
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      // Verify occupied
      let response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      const occupiedSpace = response.body.find(
        (space: any) => space.parkingSpaceId === checkInResult.parkingSpaceId,
      );
      expect(occupiedSpace.isOccupied).toBe(true);

      // Check out
      await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({
          parkingSessionId: checkInResult.parkingSessionId,
          isResident: false,
        })
        .expect(201);

      // Verify vacant again
      response = await request(app.getHttpServer())
        .get('/parking-spaces/occupation')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .expect(200);

      const vacantSpace = response.body.find(
        (space: any) => space.parkingSpaceId === checkInResult.parkingSpaceId,
      );
      expect(vacantSpace.isOccupied).toBe(false);
      expect(vacantSpace.vehicleType).toBe(VehicleType.CAR); // Shows allowed type
    });
  });

  describe('GET /parking-spaces/occupation - Authorization', () => {
    it('should return 401 when no authorization token is provided', async () => {
      await request(app.getHttpServer()).get('/parking-spaces/occupation').expect(401);
    });
  });
});
