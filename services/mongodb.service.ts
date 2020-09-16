
import { t } from "typy";
import * as _ from "lodash";

import { ObjectId } from "mongodb";
import { ConnectionPool } from "../utils/connection";
import { MongoDbUtils } from "../utils/mongodb.utils";
import { HttpError } from "../utils/http.error";
import { Model } from "../models/model";

export class MongoDBService<T extends Model> {

    protected collection: string;
    protected includes: { [key: string]: any[] } = {};
    protected pre_include: string[] = [];
    protected private_fields: string[] = []
    protected CRUD_CONFIG = {
        exclude: {
            update: ['created'],
            isToBeSkipped: (path: string, op: "add" | "update" | "delete") => {
                return (
                    this.CRUD_CONFIG.exclude[op].find((u) => {
                        u = u.indexOf(".*") > -1 ? u.replace(".*", "") : u;
                        return path.indexOf(u) > -1;
                    }) != null
                );
            },
        },
    };

    constructor(protected connectionPool: ConnectionPool) { }

    async find(filter: { [key: string]: any }, skip: number, take: number, fields: string, orderBy: { [key: string]: any }, includes: string[] = []): Promise<T[]> {
        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)

        let aggregate: any[] = this.getAggregate(filter, includes);

        return await client.db().collection(this.collection)
            .aggregate(aggregate)
            .sort(orderBy)
            .skip(skip)
            .limit(take)
            .project(MongoDbUtils.parseFields(fields, this.private_fields))
            .toArray()
            .then(res => {
                for (let r of res) {
                    this.transform(r);
                }
                return res
            })
            .catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    async findById(id: any, fields: string, includes: string[] = []): Promise<T> {
        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)

        let aggregate: any[] = [
            { $match: { _id: id } }
        ];
        this.addIncludes(aggregate, includes);

        return await client.db().collection(this.collection)
            .aggregate(aggregate)
            .project(MongoDbUtils.parseFields(fields, this.private_fields))
            .toArray()
            .then(res => {
                if (res[0]) {
                    res[0] = this.transform(res[0]);
                }
                return res[0]
            }).catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    async findOne(filter: any, fields: string, includes: string[] = []): Promise<T> {

        let aggregate: any[] = this.getAggregate(filter, includes);

        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        return await client.db().collection(this.collection)
            .aggregate<T>(aggregate)
            .skip(0)
            .limit(1)
            .project(MongoDbUtils.parseFields(fields, this.private_fields))
            .toArray()
            .then((res: T[]) => {
                if (res[0]) {
                    res[0] = this.transform(res[0]);
                }
                return res[0];
            }).catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    async add(entity: T): Promise<T> {

        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        let collection = await client.db().collection(this.collection);

        try {
            let result = await collection.insertOne(entity)
            return collection.findOne({ _id: result.insertedId })
                .then(res => {
                    if (res) {
                        res = this.transform(res);
                    }
                    return res
                }).catch(err => {
                    throw new HttpError(err.message, err, 500);
                });
        } catch (err) {
            throw new HttpError(err.message, err, 500);
        }

    }

    async updateOne(entity: T, updateFields: string, fields: string): Promise<T> {

        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        let collection = await client.db().collection(this.collection);

        let $set = {};
        updateFields = updateFields.replace(/,/g, " ")
        fields = fields.replace(/,/g, " ")
        for (let field of updateFields.split(" ")) {
            if (this.CRUD_CONFIG.exclude.isToBeSkipped(field, "update")) continue;
            _.set($set, field, t(entity, field).safeObject);
        }

        return collection.findOneAndUpdate({ _id: new ObjectId(entity.id) }, { $set }, { projection: MongoDbUtils.parseFields(fields, this.private_fields) })
            .then(result => {
                let res = result.value;
                if (res) {
                    res = this.transform(res);
                }
                return res;
            }).catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    async updateMany(conditions: any, entity: T, updateFields: string, fields: string): Promise<any> {

        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        let collection = await client.db().collection(this.collection);

        let $set = {};
        updateFields = updateFields.replace(/,/g, " ")
        fields = fields.replace(/,/g, " ")
        for (let field of updateFields.split(" ")) {
            if (this.CRUD_CONFIG.exclude.isToBeSkipped(field, "update")) continue;
            _.set($set, field, t(entity, field).safeObject);
        }

        return collection.updateMany(conditions, { $set })
            .then(result => {
                let res = result.result;
                return res;
            }).catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    async delete(id: any, fields: string): Promise<T> {
        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        let collection = await client.db().collection(this.collection);

        return collection.findOneAndDelete({ _id: id }, { projection: MongoDbUtils.parseFields(fields, this.private_fields) })
            .then(result => {
                let res = result.value;
                if (res) {
                    res = this.transform(res);
                }
                return res
            }).catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    async deleteMany(filter: any, fields: string): Promise<T> {
        let client = await this.connectionPool.connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        let collection = await client.db().collection(this.collection);

        return collection.findOneAndDelete(filter, { projection: MongoDbUtils.parseFields(fields, this.private_fields) })
            .then(result => {
                let res = result.value;
                if (res) {
                    res = this.transform(res);
                }
                return res
            }).catch(err => {
                throw new HttpError(err.message, err, 500);
            });
    }

    protected addIncludes(aggregate: any[], includes: string[]) {
        for (let include of new Set([...includes, ...this.pre_include])) {
            let commands = this.includes[include]
            if (commands) {
                aggregate.push(...commands);
            }
        }
    }

    protected getAggregate(filter: any, includes: string[]) {
        let aggregate: any[] = [
            { $match: filter }
        ];

        if (filter['#pre'] || filter['#post']) {
            aggregate = [];
        }

        if (filter['#pre']) aggregate.push({ $match: filter['#pre'] });

        this.addIncludes(aggregate, includes);

        if (filter['#post']) aggregate.push({ $match: filter['#post'] });

        return aggregate;
    };

    protected transform(entity: any) {
        entity.id = entity._id;
        delete entity._id;

        return entity;
    }

}


