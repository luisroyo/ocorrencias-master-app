import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, Clipboard } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { styles } from './styles';

interface RelatorioCorrigidoScreenProps {
    relatorio: string;
    onVoltar: () => void;
}

export const RelatorioCorrigidoScreen: React.FC<RelatorioCorrigidoScreenProps> = ({ relatorio, onVoltar }) => {
    const handleCopiar = () => {
        Clipboard.setString(relatorio);
        Alert.alert('Copiado', 'Relatório limpo copiado para a área de transferência.');
    };

    const handleEnviarWhatsApp = () => {
        if (!relatorio) {
            Alert.alert('Atenção', 'Gere o relatório limpo antes de enviar.');
            return;
        }
        const text = encodeURIComponent(relatorio);
        const urlApp = `whatsapp://send?text=${text}`;
        const urlWeb = `https://wa.me/?text=${text}`;
        Linking.canOpenURL(urlApp).then(supported => {
            if (supported) {
                Linking.openURL(urlApp);
            } else {
                Linking.openURL(urlWeb);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Relatório Corrigido</Text>
            <ScrollView style={styles.resultBox} contentContainerStyle={{ padding: 0 }}>
                <Text selectable style={styles.resultText}>{relatorio}</Text>
            </ScrollView>
            <View style={styles.buttonRow}>
                <Button title="Copiar Relatório" onPress={handleCopiar} style={styles.button} />
                <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} style={styles.button} variant="success" />
            </View>
            <Button title="Voltar" onPress={onVoltar} style={styles.buttonVoltar} variant="secondary" />
        </View>
    );
}; 