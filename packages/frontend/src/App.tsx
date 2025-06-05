import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import {Routes, Route, useNavigate} from "react-router";
import {MainLayout} from "./MainLayout.tsx";
import {useEffect, useRef, useState} from "react";
import { ValidRoutes} from "../../backend/src/shared/ValidRoutes.ts";
import type {IApiImageData} from "../../backend/src/shared/ApiImageData.ts";
import {ImageSearchForm} from "./images/ImageSearchForm.tsx";
import {ProtectedRoute} from "./ProtectedRoute.tsx";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [searchData, setSearchData] = useState("");
    const [_fetching, setFetching] = useState(true);
    const [_error, setError] = useState(false);
    const [token, setToken] = useState("");

    const navigate = useNavigate();
    const ref = useRef(0);

    console.log("hi this is the state change from app");

    useEffect(() => {
        console.log("Fetching (from App)...")
        setFetching(true);
        // Code in here will run when App is created
        // (Note in dev mode App is created twice)
        fetch("/api/images", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
            }
        })
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
        setError(false);
    }, [token]);

    function updateToken(token: string) {
        setToken(token);
        navigate("/");
    }

    function updateImageData(id: string, newName: string) {
        setImageData((prev) => prev.map((image) =>
            id === image._id ? {...image, name: newName} : image));
    }

    function handleImageSearch() {
        ref.current += 1;
        const thisRef = ref.current;

        const params = new URLSearchParams();
        params.append("nameContains", searchData.trim());

        setFetching(true);
        fetch(`/api/images/q?${params}`, {
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    if (ref.current == thisRef) setError(true);
                    console.error("Network response failed.")
                }
                return response.json();
            })
            .then((data) => {
                if (ref.current == thisRef) {
                    setImageData(data);
                    setFetching(false);
                }
            })
            .catch((error) => {
                console.error(error);
                if (ref.current == thisRef) setFetching(false);
            });
        if (ref.current == thisRef) setError(false);
    }

    function handleSearchStringChange(newString: string) {
        setSearchData(newString);
    }

    const searchPanel = <ImageSearchForm searchString={searchData} onSearchStringChange={handleSearchStringChange} onSearchRequested={handleImageSearch}/>;

    return <Routes>
        <Route path={"/"} element={<MainLayout/>}>
            <Route path={ValidRoutes.HOME} element={<ProtectedRoute authToken={token}>
                <AllImages imageData={imageData} searchPanel={searchPanel}/>
            </ProtectedRoute>}/>
            <Route path={ValidRoutes.IMAGE} element={<ProtectedRoute authToken={token}>
                <ImageDetails imageData={imageData} onNewName={updateImageData} token={token}/>
            </ProtectedRoute>}/>
            <Route path={ValidRoutes.UPLOAD} element={<ProtectedRoute authToken={token}>
                <UploadPage />
            </ProtectedRoute>}/>
            <Route path={ValidRoutes.REGISTER} element={<LoginPage isRegistering={true} onNewToken={updateToken}/>}/>
            <Route path={ValidRoutes.LOGIN} element={<LoginPage isRegistering={false} onNewToken={updateToken}/>}/>
        </Route>
    </Routes>
}

export default App;
