import React, {useActionState, useId, useState} from "react";
import type {formState} from "./LoginPage.tsx";

interface IUploadPageProps {
    token: string;
}

export function UploadPage(props: IUploadPageProps) {

    const [dataURL, setDataURL] = useState("");

    async function tryUpload(formData: FormData): Promise<{ok: boolean, status?: number}> {
        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + props.token,
                },
                body: formData,
            })

            if (!response.ok) {
                return {ok: false, status: response.status};
            }
            console.log(response.url);
            return {ok: true, status: response.status};
        }
        catch (error) {
            console.log(error);
            return {ok: false};
        }
    }

    const [result, submitAction, isPending] = useActionState(
        async (_previousState: formState | null, formData: FormData) => {
            const image = formData.get("image");

            if (!image) {
                return {
                    type: "error",
                    message: "Image was lost. Please try again.",
                };
            }

            const response = await tryUpload(formData);
            if (!response.ok) {
                const errorResult: formState = {type: "error", message: ""};
                switch (response.status) {
                    case 400: errorResult.message = "Invalid file type."; break;
                    case 500: errorResult.message = "Server error occurred. Please try again."; break;
                    default: errorResult.message = "Something went wrong. Please try again."; break;
                }
                return errorResult;
            }

            return {
                type: "success",
                message: "You have successfully uploaded your image!",
            };
        },
        null
    );

    function readAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = (err) => reject(err);
        });
    }

    async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            throw new Error("No image file found.");
        }
        const url = await readAsDataURL(e.target.files[0]);
        setDataURL(url);
    }

    const uploadButtonId = useId();

    return (
        <>
            <h2>Upload</h2>
            <form action={submitAction}>
                <div>
                    <label>Choose image to upload: </label>
                    <input
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={handleFileInputChange}
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={isPending} />
                    </label>
                </div>

                <div> {/* Preview img element */}
                    <img style={{width: "20em", maxWidth: "100%"}} src={dataURL ? dataURL : "#"} alt="" />
                </div>

                <label htmlFor={uploadButtonId}/>
                <input id={uploadButtonId} type="submit" value="Confirm upload" disabled={isPending} />
                {result && result.type === "error" && <p className={"errorText"} aria-live={"polite"}>{result.message}</p>}
                {result && result.type === "success" && <p aria-live={"polite"}>{result.message}</p>}
            </form>
        </>
    );
}
