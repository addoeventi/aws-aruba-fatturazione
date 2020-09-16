import "reflect-metadata";
import { container } from "tsyringe";
import { APIGatewayEvent, Context } from "aws-lambda";
import { HttpRequest } from "../../../utils/http/http.request";
import { Auth } from "../../../auth/auth.service";
import { generateResponse } from "../../../utils/response";

export const handler = async (event: APIGatewayEvent, context: Context, callback: (...args: any[]) => void): Promise<any> => {
    const auth = container.resolve(Auth);
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        let http: HttpRequest<any> = new HttpRequest(event);
        console.log('<= Return order infos');
        return generateResponse(JSON.stringify(http.body), 200);
    } catch (error) {
        console.log('=> Retrive order error', error);
        return generateResponse(JSON.stringify({ code: "_RETRIVE_ORDER_ERROR", error }), 500);
    }
}