// src/App.jsx
import React from 'react';
import AuthErrorHandler from './components/AuthErrorHandler'; // optional, if you've added it

function App() {
  return (
    <>
      <AuthErrorHandler />
      <h1>Welcome to M13</h1>
      {/* You can add routes, login page, dashboard, etc. here */}
    </>
  );
}

export default App;
