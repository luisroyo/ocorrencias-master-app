import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { login } from '../services/auth';

interface LoginScreenProps {
    onLogi(token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    nst[ema, setEmail] = useState('');
    const [psrd, setPassword] = useState('');
    const [loa, setLoading] = useState(false);

    const handlen = async () => {
        setLoading(t       try {
        c responsait lmail, password);
            if (response & onse.token) {
                onLogin(respon);
            }
            Alert.alert('Erponse.e || 'E - mail ou selidos');
            }
        } catch y) {
        Alert.alert('Erro', agerro ao r login');
        } fina
    Loading(false);

};

return (
    style = {
        yles.contain < Text style={ stylitle } / Text >
            <Inp placeh"E-mail"
       = { email }
               eText={ setEmail }
     oCapitalize="non     eyboardType="email- address >
    <Input
        ceholder="
               passwor            onCt={setPassword       curntry
               tton
                ti 'do...' : 'Entrar'       ss={handleLogin}
                di
            />
      );
};
 styles = Seet.crcontair: {
        flex: 1,
        backgroundColoprimaryBg,
    justifyContence        padding: 24,
     le: {
    color: lors.heaText,
        foSize: ,
        fontht'bold',
        mnBottom,
    textAlignenter',
    },
}); 