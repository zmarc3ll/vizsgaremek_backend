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
      host: 'localhost', //db nas on
      //port: 3306, // nincs szükség, mert ez a mysql default portja, de így is működik
      username: 'root',
      password: '', //root nas on
      database: 'vizsgaremek',
      entities: [
        UserData, CarData, Token, CarPicture, CalendarData, ChartData, DocumentData],
      synchronize: true,
    }),
    /*TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'vizsgaremek',
      entities: [UserData, CarData, Token, CarPicture, CalendarData, ChartData, DocumentData],
      synchronize: true,
      retryAttempts: 10,   // próbálkozik a csatlakozással
      retryDelay: 5000,    // 5 mp várakozás a retry között
    }),*/
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
