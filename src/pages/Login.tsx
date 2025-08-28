import React, { useState, useEffect } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { loginUser } from '../services/api';

interface LoginScreenProps {
    onLogin: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const loadEmail = async () => {
            try {
                const savedEmail = localStorage.getItem('savedEmail');
                if (savedEmail) setEmail(savedEmail);
            } catch (error) {
                console.error('Erro ao carregar e-mail salvo:', error);
            }
        };
        loadEmail();
    }, []);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    };

    const extractToken = (resp: any): string | null => {
        if (!resp) return null;
        const candidates = [
            resp?.data?.access_token,
            resp?.access_token,
            resp?.data?.token,
            resp?.token,
            resp?.data?.jwt,
            resp?.jwt,
        ];
        const token = candidates.find(Boolean);
        return (typeof token === 'string' && token.length > 0) ? token : null;
    };

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            alert('E-mail inválido.');
            return;
        }

        setLoading(true);

        try {
            console.log('Tentando login com:', { email, password: '***' });

            // Usar autenticação real do backend
            const response = await loginUser(email, password);

            console.log('Resposta do login:', response);

            const token = extractToken(response);
            if (token) {
                localStorage.setItem('savedEmail', email);
                onLogin(token);
                return;
            }

            console.error('Resposta da API não contém token em campos esperados:', response);
            alert('E-mail ou senha inválidos.');
        } catch (error: any) {
            console.error('Erro no login:', error);
            alert(error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: colors.primaryBg,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '380px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                alignItems: 'center'
            }}>
                <img
                    src="/assets/logo_master.png"
                    alt="Logo Master"
                    style={{
                        width: '100px',
                        height: '100px',
                        marginBottom: '16px'
                    }}
                />

                <p style={{
                    textAlign: 'center',
                    fontSize: '16px',
                    lineHeight: '22px',
                    color: colors.primaryBg,
                    marginBottom: '24px',
                    margin: '0 0 24px 0'
                }}>
                    É <span style={{ fontWeight: 'bold', color: colors.headingText }}>segurança</span>.
                    É <span style={{ fontWeight: 'bold', color: colors.headingText }}>manutenção</span>.
                    É <span style={{ fontWeight: 'bold', color: colors.headingText }}>sustentabilidade</span>.
                    É <span style={{ fontWeight: 'bold', color: colors.danger, letterSpacing: '0.5px' }}>ASSOCIAÇÃO MASTER</span>
                </p>

                <Input
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        backgroundColor: '#fff',
                        borderColor: colors.primaryBg,
                        border: `1.5px solid ${colors.primaryBg}`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        fontSize: '16px',
                        color: colors.headingText,
                        width: '100%',
                        marginBottom: '16px',
                        boxSizing: 'border-box'
                    }}
                />

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '16px'
                }}>
                    <Input
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        style={{
                            backgroundColor: '#fff',
                            borderColor: colors.primaryBg,
                            border: `1.5px solid ${colors.primaryBg}`,
                            borderRadius: '10px',
                            padding: '12px 14px',
                            fontSize: '16px',
                            color: colors.headingText,
                            flex: 1,
                            marginBottom: 0,
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            padding: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginLeft: '8px'
                        }}
                        title="Mostrar ou ocultar senha"
                    >
                        <span style={{
                            fontSize: '22px',
                            color: colors.danger
                        }}>
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                        </span>
                    </button>
                </div>

                <Button
                    title={loading ? 'Entrando...' : 'Entrar'}
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        backgroundColor: colors.danger,
                        padding: '14px',
                        borderRadius: '8px',
                        width: '100%',
                        marginTop: '8px'
                    }}
                    textStyle={{
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}
                />

                {process.env.NODE_ENV === 'development' && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        fontSize: '12px',
                        color: '#6c757d',
                        textAlign: 'center'
                    }}>
                        <strong>Modo Desenvolvimento</strong><br />
                        Backend: https://processador-relatorios-ia.onrender.com<br />
                        <br />
                        <strong>Credenciais de Teste:</strong><br />
                        Email: luisroyo25@gmail.com<br />
                        Senha: edu123cs
                    </div>
                )}
            </div>
        </div>
    );
}; 