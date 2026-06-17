import axios from "axios";

const CLOUD_NAME = "dgwrkaise";
const UPLOAD_PRESET = "digital-closet";

export async function uploadImage(file){

try{

const formData = new FormData();

formData.append(
"file",
file
);

formData.append(
"upload_preset",
UPLOAD_PRESET
);

const response =
await axios.post(
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
formData
);

return response.data.secure_url;

}
catch(error){

console.log(error.response?.data)

throw error;

}

}