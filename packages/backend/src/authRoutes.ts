import express, {Request, Response, NextFunction} from "express";
import {CredentialsProvider} from "./CredentialsProvider";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

declare module "express-serve-static-core" {
    interface Request {
        user?: IAuthTokenPayload // Let TS know what type req.user should be
    }
}

export function verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction // Call next() to run the next middleware or request handler
) {
    const authHeader = req.get("Authorization");
    // The header should say "Bearer <token string>".  Discard the Bearer part.
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).end();
    } else { // JWT_SECRET should be read in index.ts and stored in app.locals
        jwt.verify(token, req.app.locals.JWT_SECRET as string, (error, decoded) => {
            if (decoded) {
                req.user = decoded as IAuthTokenPayload; // Modify the request for subsequent handlers
                next();
            } else {
                res.status(403).end();
            }
        });
    }
}

export function registerAuthRoutes(app: express.Application, credProvider: CredentialsProvider) {
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.path}`);
        next();
    });

    app.post("/auth/register", async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).send({
                error: "Bad request",
                message: "Username and password fields are required"
            })
            return;
        }

        if (await credProvider.isUsernameTaken(username)) {
            res.status(409).send({
                error: "Username already taken",
                message: "Username must be unique; someone already has this username"
            })
            return;
        }

        await credProvider.registerUser(username, password);
        const token = await generateAuthToken(username, req.app.locals.JWT_SECRET as string);
        res.status(201).send({token});
        return;
    });

    app.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).send({
                error: "Bad request",
                message: "Username and password fields are required"
            })
            return;
        }

        try {
            const isVerified = await credProvider.verifyPassword(username, password);

            if (!isVerified) {
                res.status(401).send({
                    error: "Unauthorized",
                    message: "Username or password is incorrect"
                })
                return;
            }

            const token = await generateAuthToken(username, req.app.locals.JWT_SECRET as string);
            res.status(200).send({token});
            return;
        }
        catch (err) {
            throw new Error("bruh");
        }
    })
}