import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import UserAccountPage from './pages/UserAccountPage';
import RephraseTextPage from './pages/RephraseTextPage';
import LandingPage from './pages/LandingPage';
import { IS_DEMO_MODE } from './config';
import './index.css';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={IS_DEMO_MODE ? <LandingPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/login" element={<UserAccountPage />} />
          <Route path="/rephrase" element={<RephraseTextPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
