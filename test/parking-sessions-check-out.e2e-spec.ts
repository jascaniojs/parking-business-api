import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ParkingSpace } from '../src/parking-spaces/domain/parking-space.entity';
import { VehicleType } from '../src/parking-spaces/domain/vehicle-type.enum';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from './test-db-setup';
import { seedTestData, TestSeedData } from './helpers/seed-test-data';

describe('ParkingSessionsController - Check-out (e2e)', () => {
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

  describe('POST /parking-sessions/check-out - Success Cases', () => {
    it('should successfully check out a non-resident with a car', async () => {
      // Check in first
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      // Check out
      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('sessionLengthInHoursMinutes');
      expect(response.body).toHaveProperty('parkingSpaceId');
      expect(response.body).toHaveProperty('calculatedCharge');
      expect(response.body).toHaveProperty('fee');

      // Verify response IDs
      expect(response.body.parkingSpaceId).toBe(checkInResult.parkingSpaceId);
      expect(response.body.fee).toBe(5.0);

      // Verify database state - parking space is released
      const spaceRepository = dataSource.getRepository(ParkingSpace);
      const space = await spaceRepository.findOne({
        where: { id: checkInResult.parkingSpaceId },
      });

      expect(space).toBeDefined();
      expect(space!.currentSessionId).toBeNull();
      expect(space!.isAvailable()).toBe(true);
    });

    it('should successfully check out a non-resident with a motorcycle', async () => {
      // Check in first
      const checkInResult = await performCheckIn(VehicleType.MOTORCYCLE, false);

      // Check out
      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(201);

      // Verify response structure and IDs
      expect(response.body.parkingSpaceId).toBe(checkInResult.parkingSpaceId);
      expect(response.body.fee).toBe(3.0);

      // Verify parking space is released
      const spaceRepository = dataSource.getRepository(ParkingSpace);
      const space = await spaceRepository.findOne({
        where: { id: checkInResult.parkingSpaceId },
      });

      expect(space!.currentSessionId).toBeNull();
    });

    it('should successfully check out a resident with zero charge', async () => {
      // Check in resident
      const checkInResult = await performCheckIn(VehicleType.CAR, true);

      // Check out
      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: true,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(201);

      // Verify response structure and IDs
      expect(response.body.calculatedCharge).toBe(0);
      expect(response.body.fee).toBe(0);
      expect(response.body.parkingSpaceId).toBe(checkInResult.parkingSpaceId);

      // Verify parking space is released
      const spaceRepository = dataSource.getRepository(ParkingSpace);
      const space = await spaceRepository.findOne({
        where: { id: checkInResult.parkingSpaceId },
      });

      expect(space!.currentSessionId).toBeNull();
    });

    it('should allow parking space to be reused after check-out', async () => {
      // Check in first car
      const firstCheckIn = await performCheckIn(VehicleType.CAR, false);
      const firstSpaceId = firstCheckIn.parkingSpaceId;

      // Check out first car
      await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({
          parkingSessionId: firstCheckIn.parkingSessionId,
          isResident: false,
        })
        .expect(201);

      // Check in second car - should get the same space (first available)
      const secondCheckIn = await performCheckIn(VehicleType.CAR, false);

      expect(secondCheckIn.parkingSpaceId).toBe(firstSpaceId);
    });

    it('should handle multiple check-outs in sequence', async () => {
      // Check in 3 cars
      const checkIn1 = await performCheckIn(VehicleType.CAR, false);
      const checkIn2 = await performCheckIn(VehicleType.CAR, false);
      const checkIn3 = await performCheckIn(VehicleType.CAR, false);

      // Check out all 3
      const response1 = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({ parkingSessionId: checkIn1.parkingSessionId, isResident: false })
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({ parkingSessionId: checkIn2.parkingSessionId, isResident: false })
        .expect(201);

      const response3 = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send({ parkingSessionId: checkIn3.parkingSessionId, isResident: false })
        .expect(201);

      // Verify all succeeded
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response3.status).toBe(201);

      // Verify all spaces are released
      const spaceRepository = dataSource.getRepository(ParkingSpace);
      const space1 = await spaceRepository.findOne({ where: { id: checkIn1.parkingSpaceId } });
      const space2 = await spaceRepository.findOne({ where: { id: checkIn2.parkingSpaceId } });
      const space3 = await spaceRepository.findOne({ where: { id: checkIn3.parkingSpaceId } });

      expect(space1!.currentSessionId).toBeNull();
      expect(space2!.currentSessionId).toBeNull();
      expect(space3!.currentSessionId).toBeNull();
    });
  });

  describe('POST /parking-sessions/check-out - Bad Request Cases', () => {
    it('should return 400 when parkingSessionId is invalid (not a UUID)', async () => {
      const checkOutDto = {
        parkingSessionId: 'invalid-uuid',
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('parkingSessionId')]),
      );
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('UUID')]),
      );
    });

    it('should return 400 when isResident is invalid (not boolean)', async () => {
      // Check in first
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: 'yes' as any, // Invalid: string instead of boolean
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('isResident')]),
      );
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('boolean')]),
      );
    });

    it('should return 404 when parking session does not exist', async () => {
      const checkOutDto = {
        parkingSessionId: '550e8400-e29b-41d4-a716-446655440000',
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(404);

      expect(response.body.message).toBe('Parking session not found.');
    });

    it('should return 400 when session is already checked out', async () => {
      // Check in first
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: false,
      };

      // First check-out should succeed
      await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(201);

      // Second check-out should fail
      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(400);

      expect(response.body.message).toBe('Parking session is already finished.');
    });
  });

  describe('POST /parking-sessions/check-out - Unprocessable Entity Cases', () => {
    it('should return 422 when isResident mismatch (session is resident, request says non-resident)', async () => {
      // Check in as resident
      const checkInResult = await performCheckIn(VehicleType.CAR, true);

      // Attempt to check out with isResident=false (mismatch)
      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: false,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(422);

      expect(response.body.message).toContain('Invalid isResident value');
      expect(response.body.message).toContain('for residents');
    });

    it('should return 422 when isResident mismatch (session is non-resident, request says resident)', async () => {
      // Check in as non-resident
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      // Attempt to check out with isResident=true (mismatch)
      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: true,
      };

      const response = await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(checkOutDto)
        .expect(422);

      expect(response.body.message).toContain('Invalid isResident value');
      expect(response.body.message).toContain('for non-residents');
    });
  });

  describe('POST /parking-sessions/check-out - Edge Cases & Authorization', () => {
    it('should return 401 when no authorization token is provided', async () => {
      // Check in first
      const checkInResult = await performCheckIn(VehicleType.CAR, false);

      const checkOutDto = {
        parkingSessionId: checkInResult.parkingSessionId,
        isResident: false,
      };

      // Attempt check-out without authorization header
      await request(app.getHttpServer())
        .post('/parking-sessions/check-out')
        .send(checkOutDto)
        .expect(401);
    });
  });
});
