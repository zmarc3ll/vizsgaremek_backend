import { IsString } from "class-validator";

export default class loginDto {
    @IsString()
    username: string;
    @IsString()
    password: string;
}