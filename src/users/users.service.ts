
import * as bcrypt from 'bcrypt';
import { forwardRef, Inject, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { AddJobsRequest } from '../job/dto/add-job.request';



@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async signup(data: CreateUserRequest) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await this.prismaService.user.create({
                data: {
                    ...data,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                },
            });

            return user;
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new UnprocessableEntityException('Email already exists');
            }

            // Optional: log unexpected errors or throw a general one
            throw new InternalServerErrorException('Something went wrong');
        }
    }
    async getUser(filter: Prisma.UserWhereUniqueInput) {
        return this.prismaService.user.findUniqueOrThrow({
            where: filter,
        });
    }
}
