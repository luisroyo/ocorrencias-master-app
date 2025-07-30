import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
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
        marginBottom: 0,
        maxHeight: 400,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20,
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
        marginTop: 0,
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