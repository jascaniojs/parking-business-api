import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static create(email: string, name: string): User {
    const user = new User();

    if (!email || !name) {
      throw new Error('Email and name are required');
    }

    user.email = email.toLowerCase().trim();
    user.name = name.trim();

    if (!user.isValidEmail(user.email)) {
      throw new Error('Invalid email format');
    }

    return user;
  }
}
