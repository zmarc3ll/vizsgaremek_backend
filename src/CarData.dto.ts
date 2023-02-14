import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import UserData from './UserData.dto';

@Entity()
export default class CarData {}
