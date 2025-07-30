import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'danger' | 'success' | 'secondary';
    textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', style, textStyle, ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.button, styles[variant], style]}
            activeOpacity={0.8}
            {...props}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
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
    secondary: {
        backgroundColor: colors.secondaryBg,
    },
    text: {
        color: colors.mainText,
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 