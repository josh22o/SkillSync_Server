import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../user.entity';

@Injectable()
export class UserService {
  // In-memory storage for demonstration
  private users: User[] = [];
  private idCounter = 1;

  // Create a new user
  create(createUserDto: CreateUserDto): User {
    const newUser: User = { id: this.idCounter++, ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  // Retrieve all users
  findAll(): User[] {
    return this.users;
  }

  // Find a user by ID
  findOne(id: number): User {
    return this.users.find(user => user.id === id);
  }

  // Update a user by ID
  update(id: number, updateUserDto: UpdateUserDto): User {
    const index = this.users.findIndex(user => user.id === id);
    if (index < 0) return null;
    this.users[index] = { ...this.users[index], ...updateUserDto };
    return this.users[index];
  }

  // Delete a user by ID
  remove(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length < initialLength;
  }
}
