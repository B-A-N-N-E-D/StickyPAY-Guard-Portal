import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // ✅ Check localStorage — no API call needed for guard portal
    try {
      const saved = localStorage.getItem("guard");
      const token = localStorage.getItem("token");
      if (saved && token) {
        setUser(JSON.parse(saved));
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore parse errors
    }
    setIsLoadingAuth(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guard");
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError: null,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};