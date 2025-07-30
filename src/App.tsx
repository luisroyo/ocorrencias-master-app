import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginScreen } from './pages/Login';
import { RelatorioScreen } from './pages/Relatorio';
import { RondaScreen } from './pages/Ronda';
import Layout from './components/Layout';

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const handleLogin = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    // Se não está logado, mostra a tela de login
    if (!token) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Layout onLogout={handleLogout} />}>
                    <Route index element={<RelatorioScreen token={token} />} />
                    <Route path="relatorio" element={<RelatorioScreen token={token} />} />
                    <Route path="ronda" element={<RondaScreen token={token} />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App; 