import { type IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

interface IAllImagesProps {
    imageData: IApiImageData[];
}

export function AllImages(props: IAllImagesProps) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
        </>
    );
}
