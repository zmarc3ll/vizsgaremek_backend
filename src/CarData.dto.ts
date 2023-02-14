import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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
  carPower: number;

  @Column()
  gearType: string;
}
