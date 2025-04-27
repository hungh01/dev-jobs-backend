import { Controller, Get, Query } from '@nestjs/common';
import { JobSearchRequest } from './dto/jobsearch.request';
import { SearchEngineService } from './search-engine.service';

@Controller('search-engine')
export class SearchEngineController {
    constructor(
        private readonly searchEngineService: SearchEngineService,
    ) { }

    @Get('search')
    async search(@Query() query: JobSearchRequest) {
        const location = query.location || '';
        const page = parseInt(query.page?.toString()) || 1;
        const limit = parseInt(query.limit?.toString()) || 5;
        return await this.searchEngineService.getJobs(
            query.jobTitle,
            location,
            page,
            limit
        );
    }
}
