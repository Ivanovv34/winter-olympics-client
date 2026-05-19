import { createContext, useContext, useState } from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });

    const loggedUser = {
      id: response.data.id,
      username: response.data.username,
      role: response.data.role,
    };

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(loggedUser));

    setUser(loggedUser);

    return loggedUser;
  };

  const register = async (username, password, role) => {
    const response = await apiClient.post("/auth/register", {
      username,
      password,
      role,
    });

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}