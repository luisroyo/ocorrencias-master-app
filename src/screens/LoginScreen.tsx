import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { login } from '../services/auth';

interface LoginScreenProps {
    onLogin: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await login(email, password);
            if (response && response.token) {
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
        <View style={styles.container}>
            <View style={styles.topoBox}>
                <Image source={require('../../logo_master.png')} style={styles.logoImg} resizeMode="contain" />
                <View style={styles.institucionalBox}>
                    <Text style={styles.institucionalMsg}>É <Text style={styles.bold}>segurança</Text>.
                        É <Text style={styles.bold}>manutenção</Text>.
                        É <Text style={styles.bold}>sustentabilidade</Text>.
                        É <Text style={styles.master}>ASSOCIAÇÃO MASTER</Text></Text>
                </View>
            </View>
            <Text style={styles.title}>Login</Text>
            <Input
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <Input
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                keyboardType="default"
            />
            <Button
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleLogin}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBg,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        color: colors.headingText,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    topoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        justifyContent: 'center',
    },
    logoImg: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 18,
    },
    institucionalBox: {
        flex: 1,
        justifyContent: 'center',
    },
    institucionalMsg: {
        color: colors.primaryBg,
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
        textAlign: 'left',
    },
    bold: {
        fontWeight: 'bold',
        color: colors.headingText,
    },
    master: {
        fontWeight: 'bold',
        color: colors.danger,
        letterSpacing: 0.5,
    },
}); 