import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBg,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        color: colors.headingText,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    date: {
        color: colors.mutedText,
        fontSize: 14,
        marginBottom: 8,
    },
    status: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        color: colors.headingText,
        fontSize: 16,
        marginBottom: 16,
    },
}); 