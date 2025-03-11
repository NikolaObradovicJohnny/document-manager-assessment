import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import FileVersions from './FileVersions';
import FileDetails from './FileDetails';
import Login from './components/Login';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <div className="App">
      {token ? <button className="logout" onClick={handleLogout}>Logout</button> : null}
        <header className="App-header">
          <Routes>
            {/* Redirect to login if not authenticated */}
            <Route path="/" element={token ? <FileVersions token={token} /> : <Navigate to="/login" />} />
            <Route path="/:filename" element={token ? <FileDetails token={token} /> : <Navigate to="/login" />} />
            {/* Prevent logged-in users from accessing login page */}
            <Route path="/login" element={!token ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
