import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables BEFORE any app code runs
config({ path: resolve(__dirname, '../.env.test') });

// Log test database configuration
console.log('🧪 Test Environment Loaded:');
console.log(`   Database: ${process.env.DB_DATABASE}`);
console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
