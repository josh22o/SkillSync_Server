import { Injectable } from '@nestjs/common';

/**App service class */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
