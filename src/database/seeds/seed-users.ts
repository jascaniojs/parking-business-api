import { DataSource } from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  console.log('👤 Creating users...\n');

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '365d';

  const usersData = [
    { email: 'admin@parking.com', name: 'Admin User' },
    { email: 'user@parking.com', name: 'Regular User' },
  ];

  const userTokens: Record<string, any> = {};

  for (const userData of usersData) {
    // Create user using factory method (with domain logic)
    const user = User.create(userData.email, userData.name);
    const savedUser = await userRepository.save(user);

    // Generate JWT token
    const token = jwt.sign({ sub: savedUser.id, email: savedUser.email }, jwtSecret, {
      expiresIn: jwtExpiresIn,
    } as jwt.SignOptions);

    userTokens[savedUser.email] = {
      email: savedUser.email,
      name: savedUser.name,
      token,
    };

    console.log(`✅ Created user: ${savedUser.email}`);
  }

  // Save tokens to users.json file
  const outputPath = path.join(process.cwd(), 'users.json');
  fs.writeFileSync(outputPath, JSON.stringify(userTokens, null, 2));
  console.log(`\n📄 JWT tokens saved to: ${outputPath}`);
  console.log('\n🔑 Use these tokens in Authorization header: Bearer <token>');
}
