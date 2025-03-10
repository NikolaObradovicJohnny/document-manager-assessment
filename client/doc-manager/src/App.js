import React, { useState, useEffect } from 'react';
import './App.css';
import FileVersions from './FileVersions';
import Login from './components/Login';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {token ? (
          <div>
            <button className="logout" onClick={handleLogout}>Logout</button>
            <FileVersions token={token} />
          </div>
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </header>
    </div>
  );
}

export default App;
