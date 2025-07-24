import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBg,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        color: colors.headingText,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    topoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        justifyContent: 'center',
    },
    logoImg: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 18,
    },
    institucionalBox: {
        flex: 1,
        justifyContent: 'center',
    },
    institucionalMsg: {
        color: colors.primaryBg,
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
        textAlign: 'left',
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
    verSenhaBtn: {
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    verSenhaText: {
        color: colors.danger,
        fontSize: 16,
        fontWeight: 'bold',
    },
    senhaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        color: '#111',
        fontSize: 16,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
    },
}); 