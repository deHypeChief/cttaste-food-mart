import logo from "/admin.svg";

export const pannelData = {
    name: "Now Now Admin",
    logo: logo,
    apiUrl: import.meta.env.VITE_SERVER_API+"apis" || "http://localhost:8000/apis",
}

export function setTitle() {
    document.title = pannelData.name;
}