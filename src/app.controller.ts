import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { AppService } from './app.service';
import UserData from './entities/UserData.entity';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CarData from './entities/CarData.entity';
import { Response } from 'express';
import CarPicture from './entities/CarPicture.entity';
import CalendarData from './entities/CalendarData.entity';
import ChartData from './entities/ChartData.entity';
import DocumentData from './entities/DocumentData.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) { }

  @Post('user')
  @HttpCode(200)
  async addUser(@Body() userData: UserData) {
    const userRepo = this.dataSource.getRepository(UserData);
    userData.id = undefined;
    const user = new UserData();
    user.username = userData.username;
    user.password = await bcrypt.hash(userData.password, 5)
    user.passwordAuth = userData.passwordAuth;
    user.email = userData.email;
    user.birthDate = userData.birthDate;
    user.registrationDate = userData.registrationDate;
    delete user.passwordAuth;
    await userRepo.save(user);
    delete user.password;
    return user;
  }

  @Get('user')
  async listUsers() {
    const users = this.dataSource.getRepository(UserData);
    return await users.find();
  }

  @Get('usersCar/:id')
  async getUsersCarById(@Param('id') userId: number) {
    const carRepo = this.dataSource.getRepository(CarData);
    const usersCar = await carRepo.find({ where: { userId: { id: userId } } });
    return { cars: usersCar };
  }

  @Get('userCar/:id')
  async getUsersCarByIdJavaEdition(@Param('id') userId: number) {
    const carRepo = this.dataSource.getRepository(CarData);
    const usersCar = await carRepo.findOne({ where: { userId: { id: userId } } });
    return { cars: usersCar };
  }

  @Get('car')
  async listCars() {
    const cars = this.dataSource.getRepository(CarData);
    return await cars.find();
  }

  @Get('calendarEvent/:id')
  async getCalendarEvents(@Param('id') userId: number, @Query('limit') limit: number, @Query('from') from?: string) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    let where = { carData: car }
    let where2 = { carData: car, start: MoreThanOrEqual(from) }
    const event = await calendarRepo.find({ where: (from == undefined ? where : where2), take: limit, order: { start: 'ASC' } })
    return { calDatas: event };
  }

  @Get('carPic/:id')
  async getCarPic(@Param('id') userId: number) {
    const carPicRepo = this.dataSource.getRepository(CarPicture);
    const carRepo = this.dataSource.getRepository(CarData);
    const carId = await carRepo.find({ where: { userId: { id: userId } } });
    if (carId.length > 0) {
      const carID = carId[0].carId;
      const carPictures = await carPicRepo.find({
        where: {
          carsId: {
            carId: carID
          }
        }
      });
      return carPictures;
    }
    return [];
  }

  @Get('documents/:id')
  async getUsersDocuments(@Param('id') userId: number) {
    const documentRepo = this.dataSource.getRepository(DocumentData);
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    const doc = await documentRepo.find({ where: { carsData: car }, order: { date: 'ASC' } });
    return { docDatas: doc };
  }

  @Post('documents/:id')
  @HttpCode(200)
  async addDocument(@Body() documentData: DocumentData, @Param('id') usersId: number) {
    const documentRepo = this.dataSource.getRepository(DocumentData);
    documentData.docId = undefined;
    const doc = new DocumentData();
    doc.name = documentData.name;
    doc.date = documentData.date;
    const userId = usersId;
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    doc.carsData = car;
    documentData.carsData = car;
    doc.carsData = documentData.carsData;
    await documentRepo.save(doc);
    return doc;
  }

  @Post('calendarEvent/:carId')
  async addEvent(
    @Body() calendarData: CalendarData,
    @Param('carId') carId: number
  ) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({
      where: { carId: carId }
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const event = new CalendarData();
    event.title = calendarData.title;
    event.start = calendarData.start;
    event.comment = calendarData.comment;
    event.carData = car;

    await calendarRepo.save(event);
    return event;
  }

  @Post('car/:id')
  @HttpCode(200)
  async addCar(@Body() carData: CarData, @Param('id') usersId: number) {
    const carRepo = this.dataSource.getRepository(CarData);
    carData.carId = undefined;
    const car = new CarData();
    car.brand = carData.brand;
    car.model = carData.model;
    car.modelYear = carData.modelYear;
    car.fuelType = carData.fuelType;
    car.carPower = carData.carPower;
    car.gearType = carData.gearType;
    car.color = carData.color;
    car.chassisType = carData.chassisType;
    car.doors = carData.doors;
    car.fuelEconomy = carData.fuelEconomy;
    car.license_plate = carData.license_plate;
    car.givenName = carData.givenName;
    const userId = usersId;
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    car.userId = user;
    carData.userId = user;
    car.userId = carData.userId;
    await carRepo.save(car);
    return car
  }

  @Delete('user/:id')
  deleteUser(@Param('id') id: number) {
    const users = this.dataSource.getRepository(UserData);
    users.delete(id);
  }

  @Delete('calendarEvent/:id')
  deleteEvent(@Param('id') id: number) {
    const event = this.dataSource.getRepository(CalendarData);
    event.delete(id);
  }

  @Delete('documents/:id')
  deleteDocs(@Param('id') id: number) {
    const docs = this.dataSource.getRepository(DocumentData);
    docs.delete(id);
  }

  @Get('chart/:id')
  async getChartData(@Param('id') userId: number) {
    const chartDataRepo = this.dataSource.getRepository(ChartData);
    const carRepo = this.dataSource.getRepository(CarData);
    const carId = await carRepo.find({ where: { userId: { id: userId } } });
    if (carId.length > 0) {
      const carID = carId[0].carId;
      const chartData = await chartDataRepo.find({
        where: {
          carData: {
            carId: carID,
          }
        }
      });
      const sortedChartData = chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { chart: sortedChartData };
    }
    return [];
  }

  @Post('chart/:id')
  @HttpCode(200)
  async addChartData(@Body() chartData: ChartData, @Param('id') usersId: number) {
    const chartDataRepo = this.dataSource.getRepository(ChartData);
    chartData.chartId = undefined;
    const chart = new ChartData();
    chart.speedometer = chartData.speedometer;
    chart.date = chartData.date;
    const userId = usersId;
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    chart.carData = car;
    chartData.carData = car;
    chart.carData = chartData.carData;
    await chartDataRepo.save(chart);
    return chart;
  }

  @Get('profile')
  @UseGuards(AuthGuard('bearer'))
  ownProfile(@Request() req) {
    const user: UserData = req.user;
    return {
      email: user.email,
      birthDate: user.birthDate,
    };
  }

  @Post('uploadfile/:id')
  @UseInterceptors(FileInterceptor('carFile', {
    storage: diskStorage({
      destination: './uploadedFiles/cars',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    })
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: CarData, @Param('id') usersId: number) {
    const carPicture = new CarPicture();
    carPicture.carPic = file.filename;
    const carRepo = this.dataSource.getRepository(CarData);
    const carId = await carRepo.find({ where: { userId: { id: usersId } } }); // Assuming this is the car ID you want to find pictures for
    if (carId.length > 0) {
      const carID = carId[0].carId;
      //const carId = req.carId;
      const carDataRepository = this.dataSource.getRepository(CarData);
      const car = await carDataRepository.findOne({
        where: { carId: carID },
      });
      carPicture.carsId = car;

      const carPictureRepository = this.dataSource.getRepository(CarPicture);
      await carPictureRepository.save(carPicture);
      return carPicture;
    }
    return [];
  }

  @Get('uploadedfiles/cars/:carPic')
  async getCarPicture(@Param('carPic') carPic: string, @Res() res: Response) {
    const carPictureRepository = this.dataSource.getRepository(CarPicture);
    const carPicture = await carPictureRepository.findOne({ where: { carPic } });
    if (!carPicture || !carPicture.carPic) {
      res.status(404).send('Car picture not found');
      return;
    }
    return res.sendFile(carPicture.carPic, { root: './uploadedFiles/cars' });
  }

  //-----------------------------------------------ujak----------------------------------------------------------
/*
  @Get('users/:userId/cars')
  async getUsersCars(@Param('userId') userId: number) {
    const carRepo = this.dataSource.getRepository(CarData);

    return await carRepo.find({
      where: { userId: { id: userId } }
    });
  }

  @Post('users/:userId/cars')
  @HttpCode(200)
  async addCar(
    @Body() carData: CarData,
    @Param('userId') userId: number
  ) {
    const carRepo = this.dataSource.getRepository(CarData);
    const userRepo = this.dataSource.getRepository(UserData);

    const user = await userRepo.findOne({
      where: { id: userId }
    });

    if (!user) throw new NotFoundException('User not found');

    const car = carRepo.create({
      ...carData,
      userId: user
    });

    return await carRepo.save(car);
  }

  @Get('cars/:carId/calendar')
  async getCalendarEvents(
    @Param('carId') carId: number,
    @Query('limit') limit: number,
    @Query('from') from?: string
  ) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({
      where: { carId }
    });

    if (!car) throw new NotFoundException('Car not found');

    const where = from
      ? { carData: car, start: MoreThanOrEqual(from) }
      : { carData: car };

    return await calendarRepo.find({
      where,
      take: limit,
      order: { start: 'ASC' }
    });
  }

  @Post('cars/:carId/calendar')
  @HttpCode(200)
  async addEvent(
    @Body() calendarData: CalendarData,
    @Param('carId') carId: number
  ) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({
      where: { carId }
    });

    if (!car) throw new NotFoundException('Car not found');

    const event = calendarRepo.create({
      ...calendarData,
      carData: car
    });

    return await calendarRepo.save(event);
  }

  @Get('cars/:carId/documents')
  async getCarDocuments(@Param('carId') carId: number) {
    const docRepo = this.dataSource.getRepository(DocumentData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({ where: { carId } });
    if (!car) throw new NotFoundException('Car not found');

    return await docRepo.find({
      where: { carsData: car },
      order: { date: 'ASC' }
    });
  }

  @Post('cars/:carId/documents')
  @HttpCode(200)
  async addDocument(
    @Body() documentData: DocumentData,
    @Param('carId') carId: number
  ) {
    const docRepo = this.dataSource.getRepository(DocumentData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({ where: { carId } });
    if (!car) throw new NotFoundException('Car not found');

    const doc = docRepo.create({
      ...documentData,
      carsData: car
    });

    return await docRepo.save(doc);
  }

  @Get('cars/:carId/chart')
  async getChartData(@Param('carId') carId: number) {
    const chartRepo = this.dataSource.getRepository(ChartData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({ where: { carId } });
    if (!car) throw new NotFoundException('Car not found');

    const chartData = await chartRepo.find({
      where: { carData: car }
    });

    return chartData.sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  @Post('cars/:carId/chart')
  @HttpCode(200)
  async addChartData(
    @Body() chartData: ChartData,
    @Param('carId') carId: number
  ) {
    const chartRepo = this.dataSource.getRepository(ChartData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({ where: { carId } });
    if (!car) throw new NotFoundException('Car not found');

    const chart = chartRepo.create({
      ...chartData,
      carData: car
    });

    return await chartRepo.save(chart);
  }

  @Post('cars/:carId/upload')
  @UseInterceptors(FileInterceptor('carFile', {
    storage: diskStorage({
      destination: './uploadedFiles/cars',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('carId') carId: number
  ) {
    const carRepo = this.dataSource.getRepository(CarData);
    const picRepo = this.dataSource.getRepository(CarPicture);

    const car = await carRepo.findOne({ where: { carId } });
    if (!car) throw new NotFoundException('Car not found');

    const picture = picRepo.create({
      carPic: file.filename,
      carsId: car
    });

    return await picRepo.save(picture);
  }
*/} 