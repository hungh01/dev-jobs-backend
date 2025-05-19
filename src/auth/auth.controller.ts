import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

import { CurrentUser } from './curent-user.decorator';
import { Response } from 'express';
import { User } from 'lib/prisma-client';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.login(user, response);
    }
}
