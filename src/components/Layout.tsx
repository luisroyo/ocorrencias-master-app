import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="nav-tabs">
        <Link 
          to="/relatorio" 
          className={`nav-tab ${location.pathname === '/' || location.pathname === '/relatorio' ? 'active' : ''}`}
        >
          Relatório
        </Link>
        <Link 
          to="/ronda" 
          className={`nav-tab ${location.pathname === '/ronda' ? 'active' : ''}`}
        >
          Ronda
        </Link>
        <Link 
          to="/ocorrencias" 
          className={`nav-tab ${location.pathname.startsWith('/ocorrencias') ? 'active' : ''}`}
        >
          Ocorrências
        </Link>
      </nav>
      
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout; 