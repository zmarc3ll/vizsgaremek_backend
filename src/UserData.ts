import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class UserData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  passwordAuth: string; //the password again to make sure it matches.
}
