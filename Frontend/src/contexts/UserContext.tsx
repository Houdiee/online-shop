import { createContext, useState, useEffect } from "react";
import { type User } from "../types/user";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../main";

type UserContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  setUser: () => { },
  logout: () => { },
});

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      console.log("UserContext: useEffect - fetchUser called. Current token:", token);
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/users/me`);
        console.log("UserContext: fetchUser - API response data:", response.data);
        setUserState(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          console.log("UserContext: fetchUser - 401/403 error, clearing user state.");
          setUserState(null);
          setTokenState(null);
          localStorage.removeItem("token");
        } else {
          console.error("UserContext: Failed to fetch user data:", error);
        }
      }
    };

    if (token) {
      console.log("UserContext: useEffect - token exists, fetching user.");
      fetchUser();
    } else {
      console.log("UserContext: useEffect - no token, clearing user state.");
      setUserState(null);
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [location, token]);

  const setUser = (userData: User | null, token: string | null) => {
    console.log("UserContext: setUser called. userData:", userData, "token:", token, "localStorage token:", localStorage.getItem("token"));
    if (userData && token) {
      console.log("UserContext: setUser - setting user and token.");
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUserState(userData);
      setTokenState(token);
    } else {
      console.log("UserContext: setUser - clearing user and token.");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUserState(null);
      setTokenState(null);
    }
  };

  const logout = () => {
    setUser(null, null);
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

