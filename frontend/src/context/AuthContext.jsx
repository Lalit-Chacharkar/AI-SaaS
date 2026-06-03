// ─────────────────────────────────────────────
// context/AuthContext.jsx
// Job: Global auth state — token + user available everywhere
// ─────────────────────────────────────────────

import { createContext, useContext, useState } from 'react';

// Step 1: Create the context (the shared whiteboard)
// null = default value before provider wraps the app
const AuthContext = createContext(null);

// Step 2: Create the Provider component
// This wraps our entire app and makes auth data available to ALL children
export const AuthProvider = ({ children }) => {
  // children = whatever is wrapped inside <AuthProvider>...</AuthProvider>

  // Read token from localStorage on initial load
  // So if user refreshes the page, they stay logged in
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user'))
    // localStorage stores strings only
    // JSON.parse converts string back to object: '{"name":"Lalit"}' → { name: "Lalit" }
  );

  // login function: saves token + user to state AND localStorage
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    // JSON.stringify converts object to string: { name: "Lalit" } → '{"name":"Lalit"}'
  };

  // logout function: clears everything
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    // Step 3: Provide the values to all children
    // Any component inside AuthProvider can now access: token, user, login, logout
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 4: Custom hook for easy access
// Instead of: const { token } = useContext(AuthContext)
// Components just write: const { token } = useAuth()
export const useAuth = () => useContext(AuthContext);
