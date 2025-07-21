import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
    const [showPassword, setShowPassword] = useState(false);

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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View>
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
            </ScrollView>
        </KeyboardAvoidingView>
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
    verSenhaBtn: {
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    verSenhaText: {
        color: colors.danger,
        fontSize: 16,
        fontWeight: 'bold',
    },
    senhaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        color: '#111',
        fontSize: 16,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
    },
}); 