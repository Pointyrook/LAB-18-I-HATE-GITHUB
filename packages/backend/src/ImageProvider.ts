import {Collection, MongoClient, ObjectId} from "mongodb";

interface IImageDocument {
    _id: ObjectId,
    src: string;
    name: string;
    authorId: string;
}

export class ImageProvider {
    private collection: Collection<IImageDocument>

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    getAllImages() {
        return this.collection.find().toArray(); // Without any options, will by default get all documents in the collection as an array.
    }

    async fetchImagesWithAuthors(substring?: string) {
        const client = new MongoClient(
            `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_CLUSTER}/${process.env.DB_NAME}`
        );

        try {
            await client.connect();
            const db = client.db(process.env.DB_NAME);

            const matchStage = substring
                ? {$match: {name: {$regex: substring, $options: "i"}}}
                : null;

            const pipeline = [
                ...(matchStage ? [matchStage] : []), // add $match only if needed
                {
                    $lookup: {
                        from: "users",
                        localField: "authorId",
                        foreignField: "username",
                        as: "author"
                    }
                },
                {$unwind: "$author"}
            ];
            const images = await db.collection("images").aggregate(pipeline).toArray();

            /* console.log("Fetched images:", images); */
            return images;
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            await client.close();
        }
    }

    async updateImageName(imageId: ObjectId, newName: string): Promise<number> {
        // Do keep in mind the type of _id in the DB is ObjectId
        const documentation = await this.collection.updateOne({_id: imageId}, {$set: {name: newName}});
        return documentation.matchedCount;
    }
}