import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const axiosC = axios.create({
    baseURL: process.env.API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials:true
});

// export const axiosPrivate = axios.create({
//     baseURL: import.meta.env.VITE_API_URL,
//     headers: { 'Content-Type': 'application/json' },
//     withCredentials: true,
// });