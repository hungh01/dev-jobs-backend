import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Strategy } from "passport-local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
            //passwordField: 'password',
        });
    }

    async validate(email: string, password: string): Promise<any> {
        return this.authService.verifyUser(email, password);
    }
}