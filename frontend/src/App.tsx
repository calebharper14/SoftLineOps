import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              token
                ? <Navigate to="/dashboard" replace />
                : <Login onLogin={token => setToken(token)} />
            }
          />
          <Route
            path="/dashboard"
            element={
              token
                ? <Dashboard token={token} onLogout={() => setToken(null)} />
                : <Navigate to="/login" replace />
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;