import { createContext, useState, useEffect } from "react";
import AxiosClient from "../axiosClient/AxiosClient";
import { Circle } from "react-preloaders";
import style from "../app.module.scss";
import showErrorMessage from "../utils/showErrorMessage";
import inMemoryJwt from "../services/inMemoryJwt";
import config from "../config";

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isUserLogged, setIsUserLogged] = useState(false);

  const [data, setData] = useState();

  const handleFetchProtected = () => {
    AxiosClient.resourceClient.get("/protected").then((res) => {
      setData(res.data.message);
    }).catch(showErrorMessage );
  };

  const handleLogOut = async () => {
    try {
      await AxiosClient.authClient.delete("/logout");
      inMemoryJwt.deleteToken();
      setIsUserLogged(false);
    } catch (err) {
      showErrorMessage(err);
    }
  };

  const handleSignUp = (data) => {
   AxiosClient.authClient.post("/sign-up", data).then((res) => {
      const { accessToken, accessTokenExpiration } = res.data;
      inMemoryJwt.setToken(accessToken, accessTokenExpiration);
      setIsUserLogged(true);
    }).catch(showErrorMessage);
  };

  const handleSignIn = (data) => {
    AxiosClient.authClient.post("/sign-in", data).then((res) => {
      const { accessToken, accessTokenExpiration } = res.data;
      inMemoryJwt.setToken(accessToken, accessTokenExpiration);
      setIsUserLogged(true);
    }).catch(showErrorMessage);
  };
  
  useEffect(() => {
    AxiosClient.authClient.post("/refresh")
    .then((res) => {
      const { accessToken, accessTokenExpiration } = res.data;
      inMemoryJwt.setToken(accessToken, accessTokenExpiration);

      setIsAppReady(true);
      setIsUserLogged(true);
    }).catch((e) => {
      setIsAppReady(true);
      setIsUserLogged(false);
      console.error(e)
    });
  }, []);

  useEffect(() => {
    const handlePersistedLogout = (event) => {
      console.log("handlePersistedLogout:", event, 'event.key:', event.key);
      
      if (event.key === config.LOGOUT_STORAGE_KEY) {
        inMemoryJwt.deleteToken();
        setIsUserLogged(false);
      }
    }

    window.addEventListener("storage", handlePersistedLogout);
    return () => {
      window.removeEventListener("storage", handlePersistedLogout);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        data,
        handleFetchProtected,
        handleSignUp,
        handleSignIn,
        handleLogOut,
        isAppReady,
        isUserLogged,
      }}
    >
      {isAppReady ? (
        children
        ) : (
        <div className={style.centered}>
          <Circle/>
        </div>
        )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
