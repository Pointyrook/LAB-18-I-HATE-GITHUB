import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import {MainLayout} from "./MainLayout.tsx";
import {useEffect, useState} from "react";
import { ValidRoutes} from "../../backend/src/shared/ValidRoutes.ts";
import type {IApiImageData} from "../../backend/src/shared/ApiImageData.ts";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([]);

    const [_fetching, setFetching] = useState(true);

    const [_error, setError] = useState(false);

    console.log("hi this is the state change from app");

    useEffect(() => {
        console.log("Fetching (from App)...")
        setFetching(true);
        // Code in here will run when App is created
        // (Note in dev mode App is created twice)
        fetch("/api/images")
            .then((response) => {
                if (!response.ok) {
                    setError(true);
                    console.error("Network response failed.")
                }
                return response.json();
            })
            .then((data) => {
                setImageData(data);
                setFetching(false);
            })
            .catch((error) => {
                console.error(error);
                setFetching(false);
            });
    }, []);

    function updateImageData(id: string, newName: string) {
        setImageData((prev) => prev.map((image) =>
            id === image._id ? {...image, name: newName} : image));
    }

    return <Routes>
        <Route path={"/"} element={<MainLayout/>}>
            <Route path={ValidRoutes.HOME} element={<AllImages imageData={imageData}/>}/>
            <Route path={ValidRoutes.UPLOAD} element={<UploadPage />}/>
            <Route path={ValidRoutes.LOGIN} element={<LoginPage />}/>
            <Route path={ValidRoutes.IMAGE} element={<ImageDetails imageData={imageData} onNewName={updateImageData}/>}/>
        </Route>
    </Routes>
}

export default App;
