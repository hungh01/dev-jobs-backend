import { createParamDecorator, ExecutionContext } from "@nestjs/common";


const getCurrentUserByContext = (context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user;

};

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => getCurrentUserByContext(context)
);