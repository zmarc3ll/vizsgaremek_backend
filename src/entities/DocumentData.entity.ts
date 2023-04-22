import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";

@Entity()
export default class DocumentData {

    @PrimaryGeneratedColumn()
    docId: number;

    @Column()
    name: string;

    @Column()
    date: string;

    @ManyToOne(() => CarData, (carData) => carData.docData)
    carsData: CarData;
}