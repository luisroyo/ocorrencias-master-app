import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, Keyboard } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { login } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';
import { Feather } from '@expo/vector-icons';

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
                const savedEmail = await AsyncStorage.getItem('savedEmail');
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

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Atenção', 'E-mail inválido.');
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        try {
            const response = await login(email, password);
            if (response?.token) {
                await AsyncStorage.setItem('savedEmail', email);
                onLogin(response.token);
            } else {
                Alert.alert('Erro', 'E-mail ou senha inválidos.');
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseScreen showCredit={false} disableScroll>
            <View style={styles.container}>
                <View style={styles.loginBox}>
                    <Image
                        source={require('../../../assets/logo_master.png')}
                        style={styles.logoImg}
                        resizeMode="contain"
                    />
                    <Text style={styles.institucionalMsg}>
                        É <Text style={styles.bold}>segurança</Text>. É <Text style={styles.bold}>manutenção</Text>. É{' '}
                        <Text style={styles.bold}>sustentabilidade</Text>. É{' '}
                        <Text style={styles.master}>ASSOCIAÇÃO MASTER</Text>
                    </Text>

                    <Input
                        placeholder="E-mail"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.inputProf}
                    />

                    <View style={styles.senhaRow}>
                        <Input
                            placeholder="Senha"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            style={[styles.inputProf, { flex: 1, marginBottom: 0 }]}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword((prev) => !prev)}
                            style={styles.verSenhaBtn}
                            accessibilityLabel="Mostrar ou ocultar senha"
                        >
                            <Feather
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={22}
                                color={colors.danger}
                            />
                        </TouchableOpacity>
                    </View>

                    <Button
                        title={loading ? 'Entrando...' : 'Entrar'}
                        onPress={handleLogin}
                        disabled={loading}
                        style={styles.button}
                        textStyle={styles.buttonText}
                    />
                </View>
            </View>
        </BaseScreen>
    );
};
