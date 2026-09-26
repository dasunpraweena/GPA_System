import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header>
      <a className="brand" href="./">
        <span className="brandmark">Σ</span> semester
        <span className="brandtag">GPA CALCULATOR</span>
      </a>

      <div className="header-right">
        <span className="degree">Software Engineering · SUSL</span>

        {user && (
          <>
            <div className="user-badge">
              <span>{user.fullName || user.email}</span>
              <span className="badge">{user.role === 'admin' ? 'Admin' : user.regNo || 'Student'}</span>
            </div>
            <button className="logout-btn" onClick={logout} title="Log out">
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
};
