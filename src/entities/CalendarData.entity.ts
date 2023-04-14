import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";

@Entity()
export default class CalendarData {
    
    @PrimaryGeneratedColumn()
    calId: number;

    @Column()
    title: string;

    @Column()
    start: string;    

    @Column()
    comment: string;

    @ManyToOne(() => CarData, (carData) => carData.calendarData)
    carData: CarData;
}