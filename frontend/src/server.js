const isProduction = process.env.NODE_ENV === "production";

export const server = isProduction ?
    "https://khoa-luan-ipa8.onrender.com/api/v2" :
    "http://localhost:8000/api/v2";

export const backend_url = isProduction ?
    "https://khoa-luan-ipa8.onrender.com/" :
    "http://localhost:8000/";