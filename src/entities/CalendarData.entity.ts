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

    //REDO to one to many bc multiple events to one car
    @OneToOne(() => CarData)
    @JoinColumn()
    carData: CarData;
    
}