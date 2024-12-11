import axios from "axios";

export const axiosC = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials:true
});

// export const axiosPrivate = axios.create({
//     baseURL: import.meta.env.VITE_API_URL,
//     headers: { 'Content-Type': 'application/json' },
//     withCredentials: true,
// });