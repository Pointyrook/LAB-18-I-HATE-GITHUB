export interface IApiImageData {
    _id: string;
    src: string;
    name: string;
    author: IApiUserData;
}

export interface IApiUserData {
    _id: string,
    username: string
}

export const IMAGES: IApiImageData[] = [
    {
        _id: "0",
        src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Blue_merle_koolie_short_coat_heading_sheep.jpg",
        name: "Blue merle herding sheep",
        author: {
            _id: "0",
            username: "chunkylover23"
        }
    },
    {
        _id: "1",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Huskiesatrest.jpg/2560px-Huskiesatrest.jpg",
        name: "Huskies",
        author: {
            _id: "0",
            username: "chunkylover23"
        }
    },
    {
        _id: "2",
        src: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Taka_Shiba.jpg",
        name: "Shiba",
        author: {
            _id: "0",
            username: "chunkylover23"
        }
    },
    {
        _id: "3",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/2560px-Felis_catus-cat_on_snow.jpg",
        name: "Tabby cat",
        author: {
            _id: "1",
            username: "silas_meow"
        },
    },
    {
        _id: "4",
        src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Male_and_female_chicken_sitting_together.jpg",
        name: "Chickens",
        author: {
            _id: "2",
            username: "fulffycoat"
        }
    }
];

let fetchCount = 0;
export function fetchDataFromServer() {
    fetchCount++;
    console.log("Fetching data x" + fetchCount);
    return IMAGES;
}
