export function generateResponse(body: any, statusCode: number = 200, headers: any = null) {
    let default_headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
    return {
        statusCode: statusCode || 200,
        headers: headers ? Object.assign(default_headers, headers) : default_headers,
        body,
    };
}