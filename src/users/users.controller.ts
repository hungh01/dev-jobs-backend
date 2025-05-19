import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService, // Assuming you have a UsersService
    ) { }

    @Post('signup')
    async signup(@Body() body: CreateUserRequest) {
        return await this.usersService.signup(body);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe() {
        return { message: 'Hello from me' };
    }

}

