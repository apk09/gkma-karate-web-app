import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import KaratePortal from './components/KaratePortal';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('gkma_logged_in') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('gkma_logged_in', loggedIn ? 'true' : 'false');
  }, [loggedIn]);

  return loggedIn ? (
    <KaratePortal onLogout={() => setLoggedIn(false)} />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

export default App;
