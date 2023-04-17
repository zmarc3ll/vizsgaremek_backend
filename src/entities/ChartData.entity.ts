import { IsDate } from "class-validator";
import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";


export default class ChartData {

    @PrimaryGeneratedColumn()
    chartId: number

    @Column()
    speedometer: number;

    @Column()
    @IsDate()
    date: Date;

    /* @ManyToOne(() => CarData, (carData) => carData.chartData)
    carData: CarData; */
}