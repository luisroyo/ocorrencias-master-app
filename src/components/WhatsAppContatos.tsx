import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const contatos = [
    { label: 'Central', numero: '+5519997497922' },
    { label: 'Supervisão', numero: '+5519997304337' },
];

export const WhatsAppContatos = () => (
    <View style={styles.container}>
        {contatos.map(({ label, numero }) => (
            <TouchableOpacity
                key={numero}
                style={styles.contato}
                onPress={() => Linking.openURL(`https://wa.me/${numero}`)}
            >
                <FontAwesome name="whatsapp" size={22} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={styles.text}>{label}: {numero.replace('+55', '+55 ')}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 2,
        borderTopColor: colors.warning, // Dourado para contraste
        padding: 12,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'android' ? 32 : 16, // Espaço extra no Android
    },
    contato: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
}); 