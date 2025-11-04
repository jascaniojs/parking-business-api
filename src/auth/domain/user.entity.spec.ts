import { User } from './user.entity';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user with valid email and name', () => {
      const user = User.create('john@example.com', 'John Doe');

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('john@example.com');
      expect(user.name).toBe('John Doe');
    });

    it('should convert email to lowercase', () => {
      const user = User.create('John@EXAMPLE.COM', 'John Doe');

      expect(user.email).toBe('john@example.com');
    });

    it('should trim whitespace from email', () => {
      const user = User.create('  john@example.com  ', 'John Doe');

      expect(user.email).toBe('john@example.com');
    });

    it('should trim whitespace from name', () => {
      const user = User.create('john@example.com', '  John Doe  ');

      expect(user.name).toBe('John Doe');
    });

    it('should throw error when both email and name are missing', () => {
      expect(() => {
        User.create('', '');
      }).toThrow('Email and name are required');
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        User.create('john@@example.com', 'John Doe');
      }).toThrow('Invalid email format');
    });

  });
});
