import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import Token from './auth/token.entity';
import CarData from './entities/CarData.entity';
import CarPicture from './entities/CarPicture.entity';
import UserData from './entities/UserData.entity';
import CalendarData from './entities/CalendarData.entity';
import ChartData from './entities/ChartData.entity';
import DocumentData from './entities/DocumentData.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      username: 'root',
      password: '',
      database: 'vizsgaremek',
      entities: [
        UserData, CarData, Token, CarPicture, CalendarData, ChartData, DocumentData],
      synchronize: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
