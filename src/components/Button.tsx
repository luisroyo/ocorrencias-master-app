import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', style, ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.button, styles[variant], style]}
            activeOpacity={0.8}
            {...props}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    primary: {
        backgroundColor: colors.danger,
    },
    danger: {
        backgroundColor: colors.dangerHover,
    },
    success: {
        backgroundColor: colors.success,
    },
    text: {
        color: colors.mainText,
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 