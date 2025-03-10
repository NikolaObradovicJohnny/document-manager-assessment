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

  return (
    <div className="App">
      <header className="App-header">
        {token ? (
          <FileVersions token={token} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </header>
    </div>
  );
}

export default App;
