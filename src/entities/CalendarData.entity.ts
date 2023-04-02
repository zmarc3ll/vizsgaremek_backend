import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";

@Entity()
export default class CalendarData {
    
    @PrimaryGeneratedColumn()
    calId: number;

    @Column()
    eventName: string;

    @Column()
    EventDate: Date;

    @Column()
    comment: string;

    @OneToOne(() => CarData)
    @JoinColumn()
    carData: CarData;
    
}