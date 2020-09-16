Here put all function/routes of resource

# EXAMPLE

````
import { Auth } from "../../../../auth/auth.service";
import { HttpRequest } from "../../../../utils/http/http.request";
import { generateResponse } from "../../../../utils/response";
import "reflect-metadata";
import { container } from "tsyringe";
import { Order } from "../../models/order";
import { APIGatewayEvent, Context } from "aws-lambda";
import { ObjectId } from "mongodb";
import { OrdersService } from "../../services/Orders.service";

export const handler = async (event: APIGatewayEvent, context: Context, callback: (...args: any[]) => void): Promise<any> => {

    const auth = container.resolve(Auth);
    const ordersService: OrdersService = container.resolve(OrdersService);

    context.callbackWaitsForEmptyEventLoop = false;

    try {
        let http: HttpRequest<Order> = new HttpRequest(event);

        console.log('Get Order for ' + http.params.id || JSON.stringify(http.filter));

        console.log('=> Check authorization by Authentication header: ' + event.headers["Authorization"]);
        const token = event.headers["Authorization"];

        if (!auth.tokenAsRole(token, ["addo-tech:device"])) {
            http.fields = "-movement";
            http.filter = { $and: [http.filter, { customer: auth.getPayload(token).id }] }
            //return generateResponse(JSON.stringify({ code: "_UNAUTHORIZE", error: { message: "You don't have permissions" } }), 403);
        }

        http.filter = event.pathParameters ? { $and: [{ _id: new ObjectId(http.params.id) }, http.filter] } : http.filter;

        // Get order with filter
        console.log('=> Get order with filter: ', http.filter);
        const doc: Order = await ordersService.findOne(http.filter, http.fields, http.includes);
        console.log('<= Return order infos');
        return generateResponse(JSON.stringify(doc), 200);
    } catch (error) {
        console.log('=> Retrive order error', error);
        return generateResponse(JSON.stringify({ code: "_RETRIVE_ORDER_ERROR", error }), 500);
    }
}
````