import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import {
  GENERATE_ACCESS_TOKEN_URL,
  LOGIN_URL,
  REGISTER_URL,
} from "./endpoints";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use((req) => {
  if (req.url !== LOGIN_URL && req.url !== REGISTER_URL) {
    const token = Cookies.get("access_token");
    if (token) {
      req.headers.Authorization = `JWT ${token}`;
    }
  }
  return req;
});

axios.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const originResponse = error.config;
    const refreshToken = Cookies.get("refresh_token");
    if (status === 401 && refreshToken && location.pathname !== "/auth/login") {
      try {
        const res = await authRefreshToken();
        if (res) {
          Cookies.set("access_token", res.data["access"] || "", {
            secure: true,
            sameSite: "Strict",
            httpOnly: false,
            expires: new Date(Date.now() + 60 * 60 * 1000),
          });
          originResponse!.headers[
            "Authorization"
          ] = `JWT ${res.data["access"]}`;
          return axios.request(originResponse!);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

const authRefreshToken = () => {
  try {
    return axios.post(GENERATE_ACCESS_TOKEN_URL);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw err;
  }
};
