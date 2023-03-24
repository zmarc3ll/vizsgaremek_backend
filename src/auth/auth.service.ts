import { Injectable } from '@nestjs/common';
import UserData from 'src/entities/UserData.entity';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import Token from './token.entity';

@Injectable()
export class AuthService {
    verifyToken(token: string) {
        throw new Error('Method not implemented.');
    }
    constructor(private dataSource: DataSource) {}

    async findUserByToken(token: string) {
        const tokenRepo = this.dataSource.getRepository(Token);
        const tokenObj = await tokenRepo.findOne({
          where: { token },
          relations: { user: true },
        });
        if (tokenObj === null) {
          return null;
        }
        return tokenObj.user;
      }

    async generateTokenFor(user: UserData) {
        const veletlen = crypto.randomBytes(32);
        const tokenString = veletlen.toString('hex');

        const token = new Token();
        token.user = user;
        token.token = tokenString;
        await this.dataSource.getRepository(Token).insert(token);

        return tokenString;
    }

    async deleteTokenFor(token: string) {
      const tokenRepo = this.dataSource.getRepository(Token);
      await tokenRepo.delete({ token });
    }
}
