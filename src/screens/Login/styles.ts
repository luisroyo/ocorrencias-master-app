import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    loginBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    logoImg: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    institucionalMsg: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
        color: colors.primaryBg,
        marginBottom: 24,
    },
    bold: {
        fontWeight: 'bold',
        color: colors.headingText,
    },
    master: {
        fontWeight: 'bold',
        color: colors.danger,
        letterSpacing: 0.5,
    },
    inputProf: {
        backgroundColor: '#fff',
        borderColor: colors.primaryBg,
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.headingText,
        width: '100%',
        marginBottom: 16,
    },
    senhaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    verSenhaBtn: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    button: {
        backgroundColor: colors.danger,
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
