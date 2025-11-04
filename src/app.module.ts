import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import appConfig from './shared/config/app.config';
import databaseConfig from './shared/config/database.config';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/interface/guards/jwt-auth.guard';
import { ParkingSessionsModule } from './parking-sessions/parking-sessions.module';
import { ParkingSpacesModule } from './parking-spaces/parking-spaces.module';
import { PricesModule } from './prices/prices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    ParkingSessionsModule,
    ParkingSpacesModule,
    PricesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
