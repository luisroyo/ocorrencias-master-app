import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { login } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';

interface LoginScreenProps {
    onLogin: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Buscar e-mail salvo ao abrir a tela
        const loadEmail = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('savedEmail');
                if (savedEmail) setEmail(savedEmail);
            } catch { }
        };
        loadEmail();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await login(email, password);
            if (response && response.token) {
                // Salvar o e-mail ao fazer login
                await AsyncStorage.setItem('savedEmail', email);
                onLogin(response.token);
                return;
            }
            Alert.alert('Erro', 'E-mail ou senha inválidos');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseScreen title="Login">
            <View>
                <View style={styles.topoBox}>
                    <Image source={require('../../../assets/logo_master.png')} style={styles.logoImg} resizeMode="contain" />
                    <View style={styles.institucionalBox}>
                        <Text style={styles.institucionalMsg}>É <Text style={styles.bold}>segurança</Text>.
                            É <Text style={styles.bold}>manutenção</Text>.
                            É <Text style={styles.bold}>sustentabilidade</Text>.
                            É <Text style={styles.master}>ASSOCIAÇÃO MASTER</Text></Text>
                    </View>
                </View>
                <Input
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <View style={styles.senhaRow}>
                    <Input
                        placeholder="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        keyboardType="default"
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.verSenhaBtn}>
                        <Text style={styles.verSenhaText}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
                    </TouchableOpacity>
                </View>
                <Button
                    title={loading ? 'Entrando...' : 'Entrar'}
                    onPress={handleLogin}
                    disabled={loading}
                />
            </View>
        </BaseScreen>
    );
}; 