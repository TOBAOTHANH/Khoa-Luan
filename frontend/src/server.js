const isProduction = process.env.NODE_ENV === "production";

export const server = isProduction ?
    "https://graduation-thesis-s7kl.onrender.com/api/v2" :
    "http://localhost:8000/api/v2";

export const backend_url = isProduction ?
    "https://graduation-thesis-s7kl.onrender.com/" :
    "http://localhost:8000/";