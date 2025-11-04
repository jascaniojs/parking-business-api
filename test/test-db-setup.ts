import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.test') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_DATABASE = process.env.DB_DATABASE || 'parking_test';

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [resolve(__dirname, '../src/**/domain/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, '../src/database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: false,
  dropSchema: false,
});

/**
 * Initialize test database, run migrations, and optionally seed data
 */
export async function setupTestDatabase(): Promise<DataSource> {
  console.log('🔧 Setting up test database...');

  // First, connect to postgres database to create test database
  const postgresDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    // Connect to postgres database
    await postgresDataSource.initialize();
    console.log('✅ Connected to postgres database');

    // Drop test database if exists and create fresh
    await postgresDataSource.query(`DROP DATABASE IF EXISTS ${DB_DATABASE}`);
    await postgresDataSource.query(`CREATE DATABASE ${DB_DATABASE}`);
    console.log(`✅ Test database "${DB_DATABASE}" created`);

    // Close connection to postgres database
    await postgresDataSource.destroy();

    // Now connect to test database
    await TestDataSource.initialize();
    console.log('✅ Connected to test database');

    // Run migrations
    await TestDataSource.runMigrations();
    console.log('✅ Migrations executed');

    return TestDataSource;
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    if (postgresDataSource.isInitialized) {
      await postgresDataSource.destroy();
    }
    throw error;
  }
}

/**
 * Teardown test database - closes connection and drops database
 */
export async function teardownTestDatabase(): Promise<void> {
  try {
    // Close test database connection
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
      console.log('✅ Test database connection closed');
    }

    // Connect to postgres database to drop test database
    const postgresDataSource = new DataSource({
      type: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: 'postgres',
    });

    await postgresDataSource.initialize();
    await postgresDataSource.query(`DROP DATABASE IF EXISTS ${DB_DATABASE}`);
    console.log(`✅ Test database "${DB_DATABASE}" dropped`);
    await postgresDataSource.destroy();
  } catch (error) {
    console.error('❌ Test database teardown failed:', error);
    throw error;
  }
}

/**
 * Clear all data from test database (keep schema)
 */
export async function clearTestDatabase(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.query('TRUNCATE TABLE parking_sessions CASCADE');
    await queryRunner.query('TRUNCATE TABLE parking_spaces CASCADE');
    await queryRunner.query('TRUNCATE TABLE prices CASCADE');
    await queryRunner.query('TRUNCATE TABLE buildings CASCADE');
    await queryRunner.query('TRUNCATE TABLE users CASCADE');
  } finally {
    await queryRunner.release();
  }
}
