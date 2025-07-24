import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBg,
        padding: 16,
    },
    title: {
        color: colors.headingText,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    occurrenceTitle: {
        color: colors.headingText,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    occurrenceDate: {
        color: colors.mutedText,
        fontSize: 14,
        marginBottom: 8,
    },
    status: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
}); 