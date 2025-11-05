import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { ParkingSession } from '../src/parking-sessions/domain/parking-session.entity';
import { ParkingSpace } from '../src/parking-spaces/domain/parking-space.entity';
import { User } from '../src/auth/domain/user.entity';
import { VehicleType } from '../src/parking-spaces/domain/vehicle-type.enum';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from './test-db-setup';
import { seedTestData, TestSeedData } from './helpers/seed-test-data';

describe('ParkingSessionsController - History (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testData: TestSeedData;
  let adminToken: string;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await clearTestDatabase(dataSource);
    testData = await seedTestData(dataSource);

    // Create admin user for testing
    const userRepository = dataSource.getRepository(User);
    const adminUser = User.create('admin@parking.com', 'Admin User');
    const savedAdmin = await userRepository.save(adminUser);

    const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
    adminToken = jwt.sign({ sub: savedAdmin.id, email: savedAdmin.email }, jwtSecret, {
      expiresIn: '1h',
    });

    // Create some completed parking sessions for testing
    await createCompletedSessions(dataSource);
  });

  afterAll(async () => {
    await clearTestDatabase(dataSource);
    await app.close();
    await teardownTestDatabase();
  });

  describe('GET /parking-sessions/history - Happy Path', () => {
    it('should retrieve completed non-resident parking sessions with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/parking-sessions/history')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verify pagination metadata
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');

      // Verify session data structure
      const session = response.body.data[0];
      expect(session).toHaveProperty('parkingSpaceId');
      expect(session).toHaveProperty('checkedInAt');
      expect(session).toHaveProperty('checkedOutAt');
      expect(session).toHaveProperty('sessionLength');
      expect(session).toHaveProperty('ratePerHour');
      expect(session).toHaveProperty('totalCharge');

      // Verify session length format (e.g., "02h 30m")
      expect(session.sessionLength).toMatch(/^\d{2}h \d{2}m$/);
    });

    it('should filter sessions by parking space ID', async () => {
      // Get a parking space ID that has a completed session
      const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);
      const carSpace = await parkingSpaceRepository.findOne({
        where: { allowedVehicleType: VehicleType.CAR, isForResidents: false },
      });

      const response = await request(app.getHttpServer())
        .get('/parking-sessions/history')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ parkingSpaceId: carSpace!.id })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((s: any) => s.parkingSpaceId === carSpace!.id)).toBe(true);
    });

    it('should return 403 when non-admin user tries to access', async () => {
      await request(app.getHttpServer())
        .get('/parking-sessions/history')
        .set('Authorization', `Bearer ${testData.authToken}`) // Regular user token
        .expect(403);
    });
  });
});

/**
 * Helper function to create completed parking sessions for testing
 */
async function createCompletedSessions(dataSource: DataSource) {
  const sessionRepository = dataSource.getRepository(ParkingSession);
  const parkingSpaceRepository = dataSource.getRepository(ParkingSpace);

  // Get car spaces (seeded as spaces 11-20)
  const carSpaces = await parkingSpaceRepository.find({
    where: { allowedVehicleType: VehicleType.CAR, isForResidents: false },
    take: 5,
  });

  // Get motorcycle spaces (seeded as spaces 21-25)
  const motorcycleSpaces = await parkingSpaceRepository.find({
    where: { allowedVehicleType: VehicleType.MOTORCYCLE, isForResidents: false },
    take: 3,
  });

  // Create 5 completed car sessions
  for (const space of carSpaces) {
    const session = ParkingSession.create(space.id, VehicleType.CAR, false, 5.0);
    session.checkInAt = new Date(Date.now() - 3600000 * 3); // 3 hours ago
    session.checkOut();
    session.checkOutAt = new Date(Date.now() - 3600000 * 1); // 1 hour ago
    await sessionRepository.save(session);
  }

  // Create 3 completed motorcycle sessions
  for (const space of motorcycleSpaces) {
    const session = ParkingSession.create(space.id, VehicleType.MOTORCYCLE, false, 3.0);
    session.checkInAt = new Date(Date.now() - 3600000 * 2); // 2 hours ago
    session.checkOut();
    session.checkOutAt = new Date(Date.now() - 3600000 * 0.5); // 30 min ago
    await sessionRepository.save(session);
  }
}
