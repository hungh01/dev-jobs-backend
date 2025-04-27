import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SearchEngineModule } from './search-engine/search-engine.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { JobModule } from './job/job.module';


@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule,
        CacheModule.registerAsync({
          useFactory: async () => ({
            store: redisStore,
            host: 'localhost',
            port: 6379,
            ttl: 60 * 60 * 24,
          }),
          isGlobal: true,
        }),
      ],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService], // <-- Đừng quên inject ConfigService
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    SearchEngineModule,
    PrismaModule,
    JobModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
