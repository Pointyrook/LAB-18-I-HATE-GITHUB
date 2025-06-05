import { type IApiImageData} from "../../../backend/src/shared/ApiImageData.ts";
import { useParams } from "react-router";
import {ImageNameEditor} from "../ImageNameEditor.tsx";

interface IImageDetailsProps {
    imageData: IApiImageData[];
    onNewName: (id: string, newName: string) => void;
    token: string;
}

export function ImageDetails(props: IImageDetailsProps) {

    const imageId = useParams().imageId;

    const image = props.imageData.find(image => image._id === imageId);

    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor initialValue={image.name} imageId={image._id} onNewName={props.onNewName} token={props.token}/>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
