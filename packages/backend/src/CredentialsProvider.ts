import {Collection, MongoClient, ObjectId} from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

interface IUserDocument {
    _id: string,
    username: string,
    email: string,
}

export class CredentialsProvider {
    private readonly credentialsCollection: Collection<ICredentialsDocument>;
    private usersCollection: Collection<IUserDocument>;

    constructor(mongoClient: MongoClient) {
        const CREDS_COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        const USERS_COLLECTION_NAME = process.env.USERS_COLLECTION_NAME;
        if (!CREDS_COLLECTION_NAME || !USERS_COLLECTION_NAME) {
            throw new Error("Missing a collection name from env file");
        }
        this.credentialsCollection = mongoClient.db().collection<ICredentialsDocument>(CREDS_COLLECTION_NAME);
        this.usersCollection = mongoClient.db().collection<IUserDocument>(USERS_COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        console.log("Registering user...");
        await this.credentialsCollection.findOne({"username": username, "password": plaintextPassword})
            .then((response) => {
                if (response) return true;
            });
        // Wait for any DB operations to finish before returning!
        await bcrypt.genSalt(10)
            .then((salt) => bcrypt.hash(plaintextPassword, salt))
            .then((hashedPassword) => {
                const newUserCreds = {
                    _id: new ObjectId(),
                    username: username,
                    password: hashedPassword,
                }
                const newUser = {
                    _id: username,
                    username: username,
                    email: "madeUpEmail@nowhere.com",
                }
                this.credentialsCollection.insertOne(newUserCreds);
                this.usersCollection.insertOne(newUser);
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
                await this.credentialsCollection.findOne({"username": username});
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
        const user = await this.credentialsCollection.findOne({ "username": username });
        return !!user;
    }
}
