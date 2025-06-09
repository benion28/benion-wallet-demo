import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [{ id: 'user-id-123', name: 'Demo User' }];

  async findById(id: string) {
    return this.users.find(user => user.id === id);
  }
}
