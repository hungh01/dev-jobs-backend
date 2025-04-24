import { IsString } from "class-validator";


export class JobSearchRequest {
    @IsString()
    jobTitle: string;
    @IsString()
    location: string;
}
