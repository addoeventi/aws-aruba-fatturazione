import "reflect-metadata";
import { injectable } from "tsyringe";
import { MongoDBService } from "./mongodb.service";
import { ConnectionPool } from "../utils/connection";

@injectable()
export class GlobalService extends MongoDBService<any> {

    constructor(protected connectionPool: ConnectionPool) {
        super(connectionPool);
        this.collection = 'global_settings';
        this.pre_include = [];
        this.includes = {}
    }
}