import { Body, Controller, Delete, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddJobsRequest } from './dto/add-job.request';

@Controller('job')
export class JobController {
    constructor(
        private readonly jobService: JobService, // Assuming you have a JobService
    ) { }
    @Get('get-job')
    @UseGuards(JwtAuthGuard)
    async getJob(@Headers('cookie') header: string, @Query('page') page?: number, @Query('limit') limit?: number) {
        return await this.jobService.getJob(header, page || 1, limit || 5);
    }
    @Post('add-job')
    @UseGuards(JwtAuthGuard)
    async addJobs(@Body() job: AddJobsRequest, @Headers('cookie') header: string) {
        return await this.jobService.addJob(job, header);
    }
    @Delete('delete-job')
    @UseGuards(JwtAuthGuard)
    async deleteJob(@Headers('cookie') header: string, @Query('jobId') jobId: string) {
        return await this.jobService.deleteJob(header, jobId);
    }
}
