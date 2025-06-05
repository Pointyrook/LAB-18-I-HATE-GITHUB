import express, { Request, Response } from "express";
import dotenv from "dotenv";
import {ValidRoutes} from "./shared/ValidRoutes";
import {connectMongo} from "./connectMongo";
import {ImageProvider} from "./ImageProvider";
import {registerImageRoutes} from "./imageRoutes";
import {registerAuthRoutes, verifyAuthToken} from "./authRoutes";
import {CredentialsProvider} from "./CredentialsProvider";

dotenv.config(); // Read the .env file in the current working directory, and load values into .env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);
const credProvider = new CredentialsProvider(mongoClient);

const app = express();
app.use(express.static(STATIC_DIR));
app.use(express.json());

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("Missing JWT Secret environment variable");
}
app.locals.JWT_SECRET = jwtSecret;

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile("index.html", {
        root: STATIC_DIR
    });
});

app.use("/api/*", verifyAuthToken);

registerAuthRoutes(app, credProvider);
registerImageRoutes(app, imageProvider);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
