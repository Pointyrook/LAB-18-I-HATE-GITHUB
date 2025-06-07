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

    async updateImageName(imageId: ObjectId, newName: string, username: string): Promise<number> {
        // Do keep in mind the type of _id in the DB is ObjectId
        const isAllowedToEdit = await this.confirmAuthorship(imageId, username);
        if (!isAllowedToEdit) {
            console.error("User is not authorized to edit this image.");
            return -1;
        }
        const image = await this.collection.findOne({ _id: imageId });

        const documentation = await this.collection.updateOne({_id: imageId}, {$set: {name: newName}});
        console.log("image was updated?");
        return documentation.matchedCount;
    }

    async confirmAuthorship(imageId: ObjectId, username: string): Promise<boolean> {
        try {
            const image = await this.collection.findOne({ _id: imageId });
            if (!image) {
                return false;
            }
            return image.authorId === username;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    async createImage(src: string, name: string, authorId: string): Promise<boolean> {
        if (!src || !name || !authorId) return false;
        const newImage: IImageDocument = {
            _id: new ObjectId(),
            src: src,
            name: name,
            authorId: authorId,
        }
        await this.collection.insertOne(newImage);
        return true;
    }
}