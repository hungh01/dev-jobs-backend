import {
    IsOptional,
    IsString
} from "class-validator";


export class AddJobsRequest {
    @IsOptional()
    @IsString()
    img: string;
    @IsString()
    title: string;
    @IsString()
    companyName: string;
    @IsString()
    city: string;
    @IsString()
    @IsOptional()
    salary: string;
    @IsString()
    @IsOptional()
    exp: string;
    @IsString()
    url: string;
}
