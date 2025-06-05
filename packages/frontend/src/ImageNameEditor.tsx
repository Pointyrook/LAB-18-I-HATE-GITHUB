import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNewName: (id: string, newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    async function handleSubmitPressed() {
        console.log("Fetching (from ImageNameEditor)...");
        setIsFetching(true);
        await fetch("/api/images/" + props.imageId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: input
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    console.error("Network response failed.")
                }
            })
            .then(() => {
                props.onNewName(props.imageId, input);
                setIsFetching(false);
            })
            .catch((error) => {
                console.error(error);
                setIsFetching(false);
            });
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