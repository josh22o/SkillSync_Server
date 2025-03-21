import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../user.entity';
import { RedisService } from 'src/common/redis/cache.service';

@Injectable()
export class UserService {
  // In-memory storage for demonstration
  private users: User[] = [];
  private idCounter = 1;

  constructor(private readonly redisService: RedisService) {}

  // Create a new user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = { id: this.idCounter++, ...createUserDto };
    this.users.push(newUser);

    // Cache the new user
    await this.redisService.set(`user:${newUser.id}`, newUser, 3600);

    // Invalidate the users list cache
    await this.redisService.delete('users:all');

    return newUser;
  }

  // Retrieve all users
  async findAll(): Promise<User[]> {
    // Try to get from cache first
    const cachedUsers = await this.redisService.get<User[]>('users:all');
    if (cachedUsers) {
      return cachedUsers;
    }

    // If not in cache, get from in-memory storage
    // Cache the result (30 minutes TTL)
    await this.redisService.set('users:all', this.users, 1800);

    return this.users;
  }

  // Find a user by ID
  async findOne(id: number): Promise<User> {
    // Try to get from cache first
    const cachedUser = await this.redisService.get<User>(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from in-memory storage
    const user = this.users.find((user) => user.id === id);

    // Cache the result if found (1 hour TTL)
    if (user) {
      await this.redisService.set(`user:${id}`, user, 3600);
    }

    return user;
  }

  // Update a user by ID
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) return null;

    this.users[index] = { ...this.users[index], ...updateUserDto };

    // Update cache with new data
    await this.redisService.set(`user:${id}`, this.users[index], 3600);

    // Invalidate the users list cache
    await this.redisService.delete('users:all');

    return this.users[index];
  }

  // Delete a user by ID
  async remove(id: number): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);

    // Delete from cache
    await this.redisService.delete(`user:${id}`);

    // Invalidate the users list cache
    await this.redisService.delete('users:all');

    return this.users.length < initialLength;
  }
}
