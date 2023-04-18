import { IsDate, IsOptional } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import CarData from "./CarData.entity";

@Entity()
export default class ChartData {

    @PrimaryGeneratedColumn()
    chartId: number

    @Column()
    speedometer: number;
    
    @Column()
    date: string;

    @ManyToOne(() => CarData, (carData) => carData.chartData)
    carData: CarData;
}