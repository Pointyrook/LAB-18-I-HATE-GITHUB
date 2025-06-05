import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNewName: (id: string, newName: string) => void;
    token: string;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    async function handleSubmitPressed() {
        console.log("Fetching (from ImageNameEditor)...");
        setIsFetching(true);
        try {
            const response = await fetch("/api/images/" + props.imageId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + props.token,
                },
                body: JSON.stringify({
                    name: input
                }),
            });

            if (!response.ok) {
                console.error("Network response failed.");
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                }
                // Optionally you can throw here to jump to catch block:
                // throw new Error("Network response failed.");
            }

            // If you want to wait for response body, you could do:
            // const data = await response.json();

            props.onNewName(props.imageId, input);
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name <input disabled={isFetching} value={input} onChange={e => setInput(e.target.value)}/>
                </label>
                <button disabled={input.length === 0 || isFetching} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}