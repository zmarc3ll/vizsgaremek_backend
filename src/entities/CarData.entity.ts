import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import CarPicture from './CarPicture.entity';
import UserData from './UserData.entity';
import CalendarData from './CalendarData.entity';
import ChartData from './ChartData.entity';

@Entity()
export default class CarData {
  @PrimaryGeneratedColumn()
  carId: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  modelYear: number;

  @Column()
  fuelType: string;

  @Column()
  carPower: number;

  @Column()
  gearType: string;

  @Column()
  color: string;

  @Column()
  chassisType: string;

  @Column()
  doors: number;

  @Column()
  fuelEconomy: string;

  @Column()
  license_plate: string;

  @Column()
  givenName: string;

  @ManyToOne(() => UserData, (user) => user.cars)
  userId: UserData;

  @OneToMany(() => CalendarData, (calendar) => calendar.carData)
  calendarData: CalendarData[];

  @OneToMany(() => CarPicture, (picture) => picture.carsId)
  pictures: CarPicture[];

  /* @OneToMany(() => ChartData, (chart) => chart.carData)
  chartData: ChartData[]; */
}