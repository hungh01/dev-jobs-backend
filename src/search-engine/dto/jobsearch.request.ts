import { IsOptional, IsString } from "class-validator";


export class JobSearchRequest {
    @IsString()
    jobTitle: string;
    @IsOptional()
    @IsString()
    location: string;
    @IsOptional()
    @IsString()
    page: number;
    @IsOptional()
    @IsString()
    limit: number;
}
