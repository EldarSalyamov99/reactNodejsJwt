import axios from "axios";
import config from "../config";
import inMemoryJwt from "../services/inMemoryJwt";

const axiosClient = () => {
    const authClient = axios.create({
        baseURL: `${config.API_URL}/auth`,
        withCredentials: true, // чтобы разрешить отправку cookies в запросах
      });
      
      const resourceClient = axios.create({
        baseURL: `${config.API_URL}/resource`,
      })

      resourceClient.interceptors.request.use((config) => {
        const accessToken = inMemoryJwt.getToken();
      
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      
        return config;
      }, (error) => {
        return Promise.reject(error);
      });

    return {authClient, resourceClient}
}

export default axiosClient()