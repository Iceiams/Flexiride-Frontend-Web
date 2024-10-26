// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("admin");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken || null;
  });

  const login = (adminData, token) => {
    if (adminData && token) {
      // Giả sử adminData chứa cả id và email
      const { id, email, name } = adminData; // Tách ID và email từ adminData

      // Cập nhật trạng thái
      setAdmin({ id, email, name });
      setToken(token);

      // Lưu vào localStorage
      localStorage.setItem("admin", JSON.stringify({ id, email, name }));
      localStorage.setItem("token", token);
    } else {
      console.error("Invalid admin data or token.");
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    const savedToken = localStorage.getItem("token");
    if (savedAdmin && savedToken) {
      setAdmin(JSON.parse(savedAdmin));
      setToken(savedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
