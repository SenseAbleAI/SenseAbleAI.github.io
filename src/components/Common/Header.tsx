import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import AboutProject from './AboutProject';

const Header: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate('/rephrase')}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <div className="leading-none">
                <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                  SenseAble
                </h1>
                <span className="hidden text-[11px] font-medium text-gray-400 sm:block">
                  Accessible, meaning-preserving text
                </span>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  aria-label="About Project"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>About Project</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                  aria-label="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAboutModal && (
        <AboutProject isModal={true} onClose={() => setShowAboutModal(false)} />
      )}
    </>
  );
};

export default Header;
