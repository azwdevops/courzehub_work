import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

API.interceptors.request.use((req) => {
  if (localStorage.getItem("session_cookie")) {
    req.headers.Authorization = `Bearer ${localStorage.getItem(
      "session_cookie"
    )}`;
    req.headers.Accept = "application/json";
  }
  return req;
});

export default API;
