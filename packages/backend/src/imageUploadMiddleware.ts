import { Request, Response, NextFunction } from "express";
import multer from "multer";
import * as path from "node:path";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = process.env.IMAGE_UPLOAD_DIR;
        if (!uploadPath) {
            throw new Error("Missing path to upload directory environment variable");
        }

        const fullPath = path.join(__dirname, "..", uploadPath)

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        const splitFileName = file.mimetype.split("/");
        console.log(splitFileName);
        let fileExtension = "";
        switch (splitFileName[splitFileName.length - 1]) {
            case "png": fileExtension = "png"; break;
            case "jpg": fileExtension = "jpg"; break;
            case "jpeg": fileExtension = "jpg"; break;
            default: cb(new ImageFormatError("Unsupported image type"), "");
        }

        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + fileExtension;

        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err); // Some other error, let the next middleware handle it
}