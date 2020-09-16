import { APIGatewayEvent } from "aws-lambda";
import { MongoDbUtils } from "../../utils/mongodb.utils";

export class HttpRequest<T> {
    public skip: number = 0;
    public take: number = 20;
    public filter: any = { not_exist_field: "NO-FILTER" };
    public orderBy: { [key: string]: number } = {};
    public fields: string;
    public params: { [key: string]: any } = {};
    public queries: { [key: string]: any } = {};
    public includes: string[] = [];
    public body: T;

    constructor(httpRequest: APIGatewayEvent, options: HttpRequestOptions = new HttpRequestOptions()) {

        this.filter = options.safe ? this.filter : {};

        httpRequest.queryStringParameters = httpRequest.queryStringParameters || {}
        this.queries = httpRequest.queryStringParameters || {};
        this.skip = parseInt(this.queries.skip) || 0;
        this.take = parseInt(this.queries.take) || 0;
        this.orderBy = MongoDbUtils.parseOrderBy(this.queries.orderBy) || {};
        this.fields = (this.queries.fields || "").replace(/,/g, ' ');
        this.params = httpRequest.pathParameters || {};
        this.includes = httpRequest.queryStringParameters.includes ? httpRequest.queryStringParameters.includes.replace(/,/g, ' ').split(' ') : [];

        try {
            this.body = JSON.parse(httpRequest.body, (JSON as any).dateParser)
        } catch (error) {
            console.log("=> WARNING! Body is not a JSON")
        }

        console.log('=> Start parse filter');
        try {
            this.filter = JSON.parse(this.queries.filter, (JSON as any).dateParser)
        } catch (error) {
            console.log('<= Error to parse filter! DEFAULT VALUE: {}', error);
        }

        console.log("=> HTTP REQUEST PARSED!");
        console.log(this);
    }
}


export class HttpRequestOptions {
    public safe: boolean = false;
}


if (JSON && !(JSON as any).dateParser) {
    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
   
    (JSON as any).dateParser = function (key, value) {
        if (typeof value === 'string') {
            var a = reISO.exec(value);
            if (a)
                return new Date(value);
            a = reMsAjax.exec(value);
            if (a) {
                var b = a[1].split(/[-+,.]/);
                return new Date(b[0] ? +b[0] : 0 - +b[1]);
            }
        }
        return value;
    };

}