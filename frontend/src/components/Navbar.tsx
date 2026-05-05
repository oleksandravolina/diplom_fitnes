import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div>
          <strong>🏋️ Fitness Trainer</strong>
        </div>
        <div>
          <Link to="/">Главная</Link>
          <Link to="/plans">Планы</Link>
          <Link to="/history">История</Link>
          <Link to="/reminders">Напоминания</Link>
          <span style={{ marginLeft: '20px' }}>
            {user?.name}
          </span>
          <button 
            onClick={handleLogout}
            style={{ 
              marginLeft: '20px',
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
