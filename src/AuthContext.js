import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

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
      const { id, email, name } = adminData;

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

  // Kiểm tra token hết hạn
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime; // Trả về true nếu token đã hết hạn
    } catch (err) {
      return true;
    }
  };

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    const savedToken = localStorage.getItem("token");

    // Kiểm tra token khi load lại trang
    if (savedAdmin && savedToken) {
      if (isTokenExpired(savedToken)) {
        logout(); // Nếu token hết hạn, tự động đăng xuất
      } else {
        setAdmin(JSON.parse(savedAdmin));
        setToken(savedToken);
      }
    }
  }, []);

  useEffect(() => {
    // Kiểm tra token mỗi khi token được cập nhật
    if (token && isTokenExpired(token)) {
      logout(); // Nếu token hết hạn, tự động đăng xuất
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
