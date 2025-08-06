import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginScreen } from './pages/Login';
import { RelatorioScreen } from './pages/Relatorio';
import { RondaScreen } from './pages/Ronda';
import { OcorrenciasListScreen } from './pages/OcorrenciasList';
import { OcorrenciaDetailScreen } from './pages/OcorrenciaDetail';
import Layout from './components/Layout';
import { AdminRoute } from './components/AdminRoute';
import { useAppUpdate } from './hooks/useAppUpdate';
import { UpdateNotification } from './components/UpdateNotification';

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const { hasUpdate, isUpdating, updateApp } = useAppUpdate();

    console.log('Token carregado do localStorage:', token ? 'Presente' : 'Ausente');

    const handleLogin = (newToken: string) => {
        console.log('Salvando token:', newToken ? 'Presente' : 'Ausente');
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    // Se não está logado, mostra a tela de login
    if (!token) {
        return (
            <>
                <LoginScreen onLogin={handleLogin} />
                <UpdateNotification 
                    hasUpdate={hasUpdate} 
                    isUpdating={isUpdating} 
                    onUpdate={updateApp} 
                />
            </>
        );
    }

    return (
        <div className="App">
            <UpdateNotification 
                hasUpdate={hasUpdate} 
                isUpdating={isUpdating} 
                onUpdate={updateApp} 
            />
            <Routes>
                <Route path="/" element={<Layout onLogout={handleLogout} token={token} />}>
                    <Route index element={<RelatorioScreen token={token} />} />
                    <Route path="relatorio" element={<RelatorioScreen token={token} />} />
                    <Route path="ronda" element={
                        <AdminRoute token={token}>
                            <RondaScreen token={token} />
                        </AdminRoute>
                    } />
                    <Route path="ocorrencias" element={<OcorrenciasListScreen token={token} />} />
                    <Route path="ocorrencias/:id" element={<OcorrenciaDetailScreen token={token} />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App; 