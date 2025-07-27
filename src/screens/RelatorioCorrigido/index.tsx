import React from 'react';
import { Text, ScrollView, Alert, Linking, Clipboard, View, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';

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
        <BaseScreen title="Relatório Corrigido">
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                <View style={styles.resultBox}>
                    {Platform.OS === 'web' ? (
                        <pre style={{
                            color: '#333',
                            fontSize: 16,
                            lineHeight: '22px',
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-line',
                            margin: 0,
                            padding: 0,
                            background: 'none',
                            border: 'none',
                            maxHeight: '60vh',
                            overflow: 'auto',
                        }}>{relatorio}</pre>
                    ) : (
                        relatorio.split('\n').map((line, idx) => (
                            <Text key={idx} selectable style={styles.resultText}>{line || ' '}</Text>
                        ))
                    )}
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Copiar Relatório" onPress={handleCopiar} style={styles.button} />
                    <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} style={styles.button} variant="success" />
                </View>
                <Button title="Voltar" onPress={onVoltar} style={styles.buttonVoltar} variant="secondary" />
            </ScrollView>
        </BaseScreen>
    );
}; 