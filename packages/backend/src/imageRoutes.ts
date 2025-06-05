import express, {Request, Response} from "express";
import { ImageProvider } from "./ImageProvider";
import {ObjectId} from "mongodb";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
    const MAX_NAME_LENGTH = 100;

    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.path}`);
        next();
    });

    function waitDuration(numMs: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, numMs));
    }

    app.get("/api/images", async (req: Request, res: Response) => {
        await waitDuration(1000);
        res.send(await imageProvider.fetchImagesWithAuthors()
            .then((images) => images))
    });

    app.get("/api/images/q", async (req: Request, res: Response) => {
        const nameContains = req.query.nameContains as string;

        await waitDuration(1000);
        res.send(await imageProvider.fetchImagesWithAuthors(nameContains)
            .then((images) => images))
    })

    app.put("/api/images/:id", async (req: Request, res: Response) => {
        if (ObjectId.isValid(req.params.id)) {
            const imageId = new ObjectId(req.params.id);
            const newName = req.body.name as string;
            const username = req.user?.username;

            // BAD REQUEST check
            if (!newName || newName.trim() === "" || !username) {
                res.status(400).send({
                    error: "Bad Request",
                    message: "Details about exactly how the request was malformed"
                });
                return;
            }
            if (newName.length > MAX_NAME_LENGTH) {
                // NAME TOO LONG check
                res.status(422).send({
                    error: "Unprocessable Entity",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
                });
                return;
            }

            await waitDuration(1000);
            await imageProvider.updateImageName(imageId, newName, username)
                .then((response) => {
                    if (response === -1) {
                        res.status(401).send({
                            error: "Unauthorized",
                            message: "Only the owner of this image can edit it."
                        })
                        return;
                    }
                    else if (response === 0) {
                        // IMAGE NOT FOUND check
                        res.status(404).send({
                            error: "Not Found",
                            message: "Image does not exist"
                        });
                        return;
                    }
                    res.status(204).send();
                });
        }
        else {
            // IMAGE NOT FOUND check
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }
    })
}