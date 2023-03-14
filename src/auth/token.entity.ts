import UserData from 'src/UserData.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export default class Token {
  @PrimaryColumn()
  token: string;

  @ManyToOne(() => UserData)
  user: UserData;

  // Lejárati dátum
}