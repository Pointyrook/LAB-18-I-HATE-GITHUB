import { type IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { ImageGrid } from "./ImageGrid.tsx";
import React from "react";

interface IAllImagesProps {
    imageData: IApiImageData[];
    searchPanel: React.ReactNode;
}

export function AllImages(props: IAllImagesProps) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
            {props.searchPanel}
        </>
    );
}
