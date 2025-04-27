import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddJobsRequest } from './dto/add-job.request';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class JobService {
    constructor(
        private readonly prismaService: PrismaService, // Assuming you have a PrismaService
        private readonly authService: AuthService, // Assuming you have an AuthService
    ) { }

    async getJob(header: string, page: number, limit: number) {
        const userId = await this.getUserId(header);
        const job = await this.prismaService.job.findMany({
            where: {
                userId: userId,
                expiredAt: {
                    gte: new Date(), // Filter jobs that are not expired
                },
            },
        });
        if (!job) {
            throw new UnprocessableEntityException('No jobs found');
        }
        // Pagination logic
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedJobs = job.slice(startIndex, endIndex);
        const totalJobs = job.length;
        const totalPages = Math.ceil(totalJobs / limit);
        const paginatedResponse = {
            totalJobs,
            totalPages,
            currentPage: page,
            items: paginatedJobs,
        };
        if (paginatedResponse.items.length === 0) {
            throw new UnprocessableEntityException('No jobs found');
        }
        if (paginatedResponse.totalPages < page) {
            throw new UnprocessableEntityException('Page not found');
        }
        if (paginatedResponse.currentPage > paginatedResponse.totalPages) {
            throw new UnprocessableEntityException('Page not found');
        }
        if (paginatedResponse.items.length > 0) {
            return paginatedResponse;
        }
        // If no jobs are found, return an empty array
        return [];
    }

    async addJob(data: AddJobsRequest, header: string) {
        const userId = await this.getUserId(header);
        try {
            const job = await this.prismaService.job.create({
                data: {
                    ...data,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    expiredAt: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Set expiration date to 1 month from now
                },
            });
            return job;
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new UnprocessableEntityException('Job already exists');
            }

            // Optional: log unexpected errors or throw a general one
            throw new InternalServerErrorException('Something went wrong');
        }
    }


    async getUserId(token: string): Promise<number> {
        return this.authService.getUserId(token);
    }

    async deleteJob(header: string, jobId: string) {
        const userId = await this.getUserId(header);
        const job = await this.prismaService.job.deleteMany({
            where: {
                id: parseInt(jobId),
                userId: userId,
            },
        });
        if (!job) {
            throw new UnprocessableEntityException('No jobs found');
        }
        return job;
    }
}
