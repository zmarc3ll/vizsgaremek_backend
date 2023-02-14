import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserData from './UserData.dto';

@Entity()
export default class CarData {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => UserData, (user) => user.cars)
  users: CarData;
}
