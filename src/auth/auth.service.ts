import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from '@prisma/client';
import * as ms from 'ms';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }


    async login(user: User, response: Response) {
        const expires = new Date();
        expires.setMilliseconds(
            expires.getMilliseconds() +
            ms(this.configService.get<string>('JWT_EXPIRES_IN') as ms.StringValue)
        );
        const TokenPayload: TokenPayload = {
            userId: user.id
        };
        const token = this.jwtService.sign(TokenPayload);
        response.cookie('Authentication', token, {
            secure: true,
            httpOnly: true,
            expires
        });
        return { TokenPayload };
    }

    async verifyUser(email: string, password: string) {
        try {
            const user = await this.usersService.getUser({ email });
            const authenticated = await bcrypt.compare(password, user.password)
            if (!authenticated) {
                throw new UnauthorizedException('Credentials are not valid');
            }
            return user;
        } catch (error) {
            throw new UnauthorizedException('Credentials are not valid');
        }
    }

    verifyToken(jwt: string) {
        this.jwtService.verify(jwt);
    }

    getUserId(jwt: string): number {

        if (!jwt) {
            throw new UnauthorizedException('No token provided');
        }

        const cookies = jwt.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=').map(part => part.trim());
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        try {
            const payload = this.jwtService.verify<TokenPayload>(cookies['Authentication']);
            return payload.userId;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
