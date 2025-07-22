import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, Clipboard } from 'react-native';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBg,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        color: colors.headingText,
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    resultBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        maxHeight: 320,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    resultText: {
        color: '#333',
        fontSize: 16,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
    buttonVoltar: {
        marginTop: 8,
        backgroundColor: colors.secondaryBg,
    },
}); 