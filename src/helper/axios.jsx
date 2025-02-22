import axios from "axios";

// Set the baseURL dynamically using an environment variable or a default value
const ApiAxios= axios.create({
  baseURL: "http://192.168.29.82:8000/", 
  // baseURL: "https://api.maitriai.com/aryan_properties", // Use environment variable if available
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": true,
  },
});

export default ApiAxios;
