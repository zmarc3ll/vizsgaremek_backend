import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsDate,
  IsOptional,
} from 'class-validator';
import {
  Column,
  Entity,
  IsNull,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import CarData from './CarData.entity';

const now = new Date();
function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

function formatDate(date: Date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
}

@Entity()
export default class UserData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MinLength(3)
  @MaxLength(10)
  username: string;

  @IsString()
  @MinLength(6)
  @Column()
  password: string;

  @IsString()
  @MinLength(6)
  @Column()
  passwordAuth: string; //the password again to make sure it matches.

  @IsEmail()
  @Column()
  email: string;

  @IsDate()
  @Column({ default: formatDate(now) })
  birthDate: Date;

  @IsDate()
  @IsOptional()
  @Column({ default: formatDate(now) })
  registrationDate: Date;

  @OneToMany(() => CarData, (car) => car.users)
  cars: CarData[];
}
