import {Collection, MongoClient, ObjectId} from "mongodb";

interface IUserDocument {
    _id: string,
    username: string,
    email: string,
}

export class UserProvider {
    private collection: Collection<IUserDocument>;

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.USERS_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing USERS_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }


}