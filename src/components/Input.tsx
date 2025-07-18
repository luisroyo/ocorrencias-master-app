import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

export const Input: React.FC<TextInputProps> = (props) => {
    return (
        <TextInput
            style={styles.input}
            placeholderTextColor={colors.mutedText}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: colors.surface,
        color: colors.headingText,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.secondaryBg,
    },
}); 