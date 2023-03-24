import UserData from 'src/entities/UserData.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export default class Token {
  @PrimaryColumn()
  token: string;

  @ManyToOne(() => UserData)
  user: UserData;

  // Lejárati dátum
}