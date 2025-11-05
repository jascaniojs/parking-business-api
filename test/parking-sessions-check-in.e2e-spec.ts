import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ParkingSpace } from '../src/parking-spaces/domain/parking-space.entity';
import { VehicleType } from '../src/parking-spaces/domain/vehicle-type.enum';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from './test-db-setup';
import { seedTestData, TestSeedData } from './helpers/seed-test-data';

describe('ParkingSessionsController - Check-in (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testData: TestSeedData;

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

  describe('POST /parking-sessions/check-in - Success Cases', () => {
    it('should successfully check in a non-resident with a car', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(201);

      expect(response.body).toHaveProperty('parkingSessionId');
      expect(response.body).toHaveProperty('parkingSpaceId');
      expect(typeof response.body.parkingSessionId).toBe('string');
      expect(response.body.parkingSessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(typeof response.body.parkingSpaceId).toBe('number');

      // Verify that the parking space is now occupied
      const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);
      const occupiedSpace = await parkingSpaceRepository.findOne({
        where: { id: response.body.parkingSpaceId },
      });

      expect(occupiedSpace).toBeDefined();
      expect(occupiedSpace!.currentSessionId).toBe(response.body.parkingSessionId);
      expect(occupiedSpace!.isAvailable()).toBe(false);
    });

    it('should successfully check in a non-resident with a motorcycle', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.MOTORCYCLE,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(201);

      expect(response.body).toHaveProperty('parkingSessionId');
      expect(response.body).toHaveProperty('parkingSpaceId');

      // Verify the space is for motorcycles
      const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);
      const assignedSpace = await parkingSpaceRepository.findOne({
        where: { id: response.body.parkingSpaceId },
      });

      expect(assignedSpace).toBeDefined();
      expect(assignedSpace!.allowedVehicleType).toBe(VehicleType.MOTORCYCLE);
      expect(assignedSpace!.isForResidents).toBe(false);
    });

    it('should successfully check in a resident', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: true,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(201);

      expect(response.body).toHaveProperty('parkingSessionId');
      expect(response.body).toHaveProperty('parkingSpaceId');

      // Verify the space is for residents
      const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);
      const assignedSpace = await parkingSpaceRepository.findOne({
        where: { id: response.body.parkingSpaceId },
      });

      expect(assignedSpace).toBeDefined();
      expect(assignedSpace!.isForResidents).toBe(true);
    });

    it('should assign different spaces for multiple check-ins', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      const response1 = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(201);

      expect(response1.body.parkingSpaceId).not.toBe(response2.body.parkingSpaceId);
      expect(response1.body.parkingSessionId).not.toBe(response2.body.parkingSessionId);
    });
  });

  describe('POST /parking-sessions/check-in - Bad Request Cases', () => {
    it('should return 400 when buildingId is missing', async () => {
      const checkInDto = {
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('buildingId')]),
      );
    });

    it('should return 400 when vehicleType is missing', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('vehicleType')]),
      );
    });

    it('should return 400 when isResident is missing', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('isResident')]),
      );
    });

    it('should return 401 when no authorization token is provided', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .send(checkInDto)
        .expect(401);
    });
  });

  describe('POST /parking-sessions/check-in - Conflict Cases', () => {
    it('should return 409 when no car spaces are available', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      // Fill all car spaces
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/parking-sessions/check-in')
          .set('Authorization', `Bearer ${testData.authToken}`)
          .send(checkInDto)
          .expect(201);
      }

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(409);

      expect(response.body.message).toBe('No empty spaces available.');
    });

    it('should return 409 when no motorcycle spaces are available', async () => {
      // Occupy all motorcycle spaces (spaces 21-25, total 5 spaces)
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.MOTORCYCLE,
        isResident: false,
      };

      // Fill all motorcycle spaces
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/parking-sessions/check-in')
          .set('Authorization', `Bearer ${testData.authToken}`)
          .send(checkInDto)
          .expect(201);
      }

      // Next request should fail
      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(409);

      expect(response.body.message).toBe('No empty spaces available.');
    });

    it('should return 409 when no resident spaces are available', async () => {
      // Occupy all resident spaces (spaces 1-10, total 10 spaces)
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: true,
      };

      // Fill all resident spaces
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/parking-sessions/check-in')
          .set('Authorization', `Bearer ${testData.authToken}`)
          .send(checkInDto)
          .expect(201);
      }

      // Next request should fail
      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto)
        .expect(409);

      expect(response.body.message).toBe('No empty spaces available.');
    });

    it('should return 409 for car when car spaces are full but motorcycle spaces are available', async () => {
      // Fill all car spaces
      const carCheckInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/parking-sessions/check-in')
          .set('Authorization', `Bearer ${testData.authToken}`)
          .send(carCheckInDto)
          .expect(201);
      }

      // Try to check in another car (should fail even though motorcycle spaces exist)
      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(carCheckInDto)
        .expect(409);

      expect(response.body.message).toBe('No empty spaces available.');

      // Verify motorcycle can still check in
      const motorcycleCheckInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.MOTORCYCLE,
        isResident: false,
      };

      await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(motorcycleCheckInDto)
        .expect(201);
    });
  });

  describe('POST /parking-sessions/check-in - Edge Cases', () => {
    it('should handle check-in for non-existent building gracefully', async () => {
      const checkInDto = {
        buildingId: 99999,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-in')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkInDto);

      expect([409]).toContain(response.status);
    });

    it('should properly handle concurrent check-ins', async () => {
      const checkInDto = {
        buildingId: testData.buildingId,
        vehicleType: VehicleType.CAR,
        isResident: false,
      };

      // Make 3 concurrent requests
      const promises = Array(3)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/parking-sessions/check-in')
            .set('Authorization', `Bearer ${testData.authToken}`)
            .send(checkInDto),
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // All should have different parking space IDs
      const spaceIds = responses.map((r) => r.body.parkingSpaceId);
      const uniqueSpaceIds = new Set(spaceIds);
      expect(uniqueSpaceIds.size).toBe(3);
    });
  });
});
