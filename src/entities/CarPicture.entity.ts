import { Column, Entity,JoinColumn,ManyToOne,OneToOne,PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";

@Entity()
export default class CarPicture{

    @PrimaryGeneratedColumn()
    picId: number;

    @Column()
    carPic: string;

    @ManyToOne(() => CarData, (car) => car.pictures)
    @JoinColumn()
    carsId: CarData;
}