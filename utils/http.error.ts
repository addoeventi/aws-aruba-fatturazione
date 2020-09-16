import { generateResponse } from "./response";

export class HttpError extends Error{

    public message: string;
    public body: any;
    public code: number

    constructor(message: string, body: any, code: number = 500) {
        super(message);
        this.body = body;
        this.code = code;
    }

    static HandleError(err: any | HttpError) {
        if (err instanceof HttpError) {
            return generateResponse(err.body, err.code);
        }

        return HttpError.HandleError(new HttpError(err.message, err, 500));
    }
}