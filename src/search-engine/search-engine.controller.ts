import { Controller, Get, Query } from '@nestjs/common';
import { JobSearchRequest } from './dto/jobsearch.request';
import { SearchEngineService } from './search-engine.service';

@Controller('search-engine')
export class SearchEngineController {
    constructor(
        private readonly searchEngineService: SearchEngineService, // Assuming you have a SearchEngineService
    ) { }
    @Get('search')
    async search(@Query() query: JobSearchRequest) {
        return await this.searchEngineService.search(query.jobTitle, query.location);
    }
}
