import AxiosClient from "../axiosClient/AxiosClient";
import config from "../config";

const inMemoryJwt = () => {
    let inMemoryJwt = null;
    let refreshTimeoutId = null;

    const refreshToken = (expiration) => {
        const timeoutTrigger = expiration - 10000
        refreshTimeoutId = setTimeout(() => {
            AxiosClient.authClient.post("/refresh").then((res) => {
                const { accessToken, accessTokenExpiration } = res.data
                setToken(accessToken, accessTokenExpiration)
            }).catch((e) => console.error(e))
        }, +timeoutTrigger)
    };

    const abortRefreshToken = () => {
        if (refreshTimeoutId) clearInterval(refreshTimeoutId)
            refreshTimeoutId = null
    }

    const getToken = () => inMemoryJwt;

    const setToken = (token, tokenExpiration) => {
        inMemoryJwt = token;
        console.log("setToken:", tokenExpiration);
        
        refreshToken(tokenExpiration);
    };


    const deleteToken = () => {
        inMemoryJwt = null;
        abortRefreshToken();
        localStorage.setItem(config.LOGOUT_STORAGE_KEY, Date.now())
    }

    return { getToken, setToken, deleteToken };
}

export default inMemoryJwt();
