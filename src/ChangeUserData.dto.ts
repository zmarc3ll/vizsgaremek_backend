import { IsOptional } from "class-validator";

export default class ChangeUserData {
    @IsOptional()
    username: string;

    @IsOptional()
    password: string;

    @IsOptional()
    passwordAuth:string;
}