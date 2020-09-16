import { MongoClient } from "mongodb";
import { singleton } from "tsyringe";

@singleton()
export class ConnectionPool {

    cachedDb: MongoClient = null;

    connectToDatabase(uri) {
        console.log('=> connect to database');

        if (this.cachedDb) {
            console.log('=> using cached database instance');
            return Promise.resolve(this.cachedDb);
        }

        return MongoClient.connect(uri, {connectTimeoutMS: 5000 })
            .then(db => {
                this.cachedDb = db;
                return this.cachedDb;
            });
    }
}