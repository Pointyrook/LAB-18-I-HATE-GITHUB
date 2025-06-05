import {Collection, MongoClient, ObjectId} from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        console.log("Registering user...");
        await this.collection.findOne({"username": username, "password": plaintextPassword})
            .then((response) => {
                if (response) return true;
            });
        // Wait for any DB operations to finish before returning!
        await bcrypt.genSalt(10)
            .then((salt) => bcrypt.hash(plaintextPassword, salt))
            .then((hashedPassword) => {
                const newUser = {
                    _id: new ObjectId(),
                    username: username,
                    password: hashedPassword,
                }
                this.collection.insertOne(newUser);
                return true;
            })
            .catch((err) => {
                console.log(err);
                return false;
            });
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        try {
            console.log("Verifying username...");
            const user =
                await this.collection.findOne({"username": username});
            if (!user) return false;

            console.log("Verifying password...");
            return await bcrypt.compare(plaintextPassword, user.password);
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    async isUsernameTaken(username: string) {
        const user = await this.collection.findOne({ "username": username });
        return !!user;
    }
}
