import { seedUsers } from './seed-users';
import { seedParking } from './seed-parking';
import { AppDataSource } from '../data-source';

async function clearData() {
  const queryRunner = AppDataSource.createQueryRunner();

  console.log('Clearing existing data...\n');

  try {
    await queryRunner.query('TRUNCATE TABLE parking_sessions CASCADE');
    await queryRunner.query('TRUNCATE TABLE parking_spaces CASCADE');
    await queryRunner.query('TRUNCATE TABLE prices CASCADE');
    await queryRunner.query('TRUNCATE TABLE buildings CASCADE');
    await queryRunner.query('TRUNCATE TABLE users CASCADE');

    console.log('All data cleared\n');
  } finally {
    await queryRunner.release();
  }
}

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Starting database seeding...\n');

    await clearData();
    await seedUsers(AppDataSource);
    await seedParking(AppDataSource);

    console.log('\nDatabase seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();
