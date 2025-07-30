import React, { useState, useRef, useEffect } from 'react';
import { Animated, TextInput, View, StyleSheet, TextInputProps, Text, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface AnimatedInputProps extends TextInputProps {
    label: string;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({ label, value, style, editable = true, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedIsFocused, {
            toValue: isFocused || value ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        position: 'absolute' as const,
        left: 14,
        top: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
        }),
        fontSize: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [17, 13],
        }),
        color: isFocused ? colors.primaryBg : colors.mutedText,
        backgroundColor: 'transparent',
        paddingHorizontal: 4,
        zIndex: 2,
        fontWeight: '500' as '500',
        letterSpacing: 0.2,
    };

    return (
        <View style={[styles.container, style]}>
            <Animated.Text style={labelStyle}>{label}</Animated.Text>
            <TextInput
                {...props}
                value={value}
                editable={editable}
                style={[
                    styles.input,
                    !editable && styles.inputDisabled,
                    isFocused && editable && styles.inputFocused,
                    props.multiline && styles.inputMultiline,
                ]}
                onFocus={e => {
                    setIsFocused(true);
                    props.onFocus && props.onFocus(e);
                }}
                onBlur={e => {
                    setIsFocused(false);
                    props.onBlur && props.onBlur(e);
                }}
                placeholder={isFocused ? '' : props.placeholder}
                placeholderTextColor={colors.mutedText}
                selectionColor={colors.primaryBg}
                cursorColor={editable ? colors.primaryBg : colors.mutedText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        paddingTop: 8,
    },
    input: {
        backgroundColor: '#F5F7FA',
        color: colors.headingText,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'web' ? 12 : 14,
        fontSize: 17,
        borderWidth: 1,
        borderColor: colors.secondaryBg,
        zIndex: 1,
        fontWeight: '400',
        shadowColor: 'transparent',
        minHeight: 44,
        marginTop: 0,
    },
    inputFocused: {
        borderColor: colors.primaryBg,
        backgroundColor: '#F0F6FA',
        shadowColor: colors.primaryBg,
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    inputDisabled: {
        backgroundColor: '#E9ECEF',
        color: colors.mutedText,
        borderColor: '#D1D5DB',
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
}); 