import { Module } from '@nestjs/common';
import { SearchEngineController } from './search-engine.controller';
import { SearchEngineService } from './search-engine.service';

@Module({
  controllers: [SearchEngineController],
  providers: [SearchEngineService]
})
export class SearchEngineModule {}
