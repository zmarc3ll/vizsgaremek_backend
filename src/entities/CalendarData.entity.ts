import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";
import { IsOptional, Length, MaxLength } from "class-validator";

@Entity()
export default class CalendarData {
    
    @PrimaryGeneratedColumn()
    calId: number;

    @Column()
    title: string;

    @Column()
    start: string;    

    @Column()
    @MaxLength(100)
    @IsOptional()
    comment: string;

    @ManyToOne(() => CarData, (carData) => carData.calendarData)
    carData: CarData;
}