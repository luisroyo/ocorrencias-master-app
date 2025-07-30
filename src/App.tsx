import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Relatorio from './pages/Relatorio';
import Ronda from './pages/Ronda';
import OccurrencesList from './pages/OccurrencesList';
import OccurrenceDetail from './pages/OccurrenceDetail';
import Layout from './components/Layout';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Relatorio />} />
                    <Route path="relatorio" element={<Relatorio />} />
                    <Route path="ronda" element={<Ronda />} />
                    <Route path="ocorrencias" element={<OccurrencesList />} />
                    <Route path="ocorrencias/:id" element={<OccurrenceDetail />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App; 