import React, {useActionState} from "react";
import "./LoginPage.css";
import {Link} from "react-router";

interface ILoginPageProps {
    isRegistering: boolean;
    onNewToken: (token: string) => void;
}

export type formState = {
    type: string,
    message: string
}

type thisStupidTypeScriptError = formState | Promise<formState | null> | null;

export function LoginPage(props: ILoginPageProps) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();

    async function contactDatabase(username: string, password: string, path: string): Promise<Response> {
        return await fetch("/auth/" + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
    }

    async function tryRegister(username: string, password: string): Promise<{ok: boolean, status?: number}> {
        console.log("Fetching (from LoginPage)...");
        try {
            const response = await contactDatabase(username, password, "register");

            if (!response.ok) {
                return {ok: false, status: response.status};
            }

            const data = await response.json();
            const token = data.token;
            props.onNewToken(token);

            await fetch("/", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                }
            });

            return {ok: true};
        }
        catch (error) {
            console.log(error);
            return {ok: false};
        }
    }

    async function tryLogin(username: string, password: string): Promise<{ok: boolean, status?: number}> {
        try {
            const response = await contactDatabase(username, password, "login");

            if (!response.ok) {
                return {ok: false, status: response.status};
            }

            const data = await response.json();
            const token = data.token;
            props.onNewToken(token);

            await fetch("/", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                }
            });

            return {ok: true};
        }
        catch (error) {
            console.log(error);
            return {ok: false};
        }
    }

    const [result, submitAction, isPending] = useActionState(
        async (_previousState: thisStupidTypeScriptError, formData: FormData) => {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;

            if (!username || !password) {
                return {
                    type: "error",
                    message: `Please fill in your username and password.`,
                };
            }

            const response = props.isRegistering ? await tryRegister(username, password) : await tryLogin(username, password);
            if (!response.ok) {
                const errorResult: formState = {type: "error", message: ""};
                switch (response.status) {
                    case 400: errorResult.message = "Invalid username or password."; break;
                    case 409: errorResult.message = "Username already exists. Try a different one!"; break;
                    case 500: errorResult.message = "Server error occurred. Please try again."; break;
                    default: errorResult.message = "Something went wrong. Please try again."; break;
                }
                return errorResult;
            }

            return {
                type: "success",
                message: `You have successfully ${props.isRegistering ? "registered!" : "logged in!"}`,
            };
        },
        null
    );

    return (
        <>
            {result && result.type !== "error" && <p className={`message ${result.type}`}>{result.message}</p>}
            {isPending && <p className="message loading">Loading ...</p>}
            <h2>{props.isRegistering ? "Register a new account" : "Log in"}</h2>
            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} required={true} name={"username"} disabled={isPending} />

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} type="password" required={true} name={"password"} disabled={isPending} />

                <input type="submit" value="Submit" disabled={isPending} />
                {result && result.type === "error" && <p className={"errorText"} aria-live={"polite"}>{result.message}</p>}
            </form>
            {!props.isRegistering && <>
                <p>Don't have an account?</p>
                <Link to={"/register"}>Register here</Link>
            </>}
        </>
    );
}

