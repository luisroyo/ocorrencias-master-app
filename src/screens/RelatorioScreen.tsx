import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Alert, ScrollView, Platform,
    TouchableOpacity, Linking, Clipboard, KeyboardAvoidingView, Image
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { analisarRelatorio } from '../services/relatorios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator } from 'react-native';
import { AnimatedInput } from '../components/AnimatedInput';
import { buscarColaboradores } from '../services/colaboradores';
import { useEffect, useRef } from 'react';
import { Linking as RNLinking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { buscarEnderecos } from '../services/enderecos';

// Substituir os ícones SVG inline por ícones do MaterialCommunityIcons
// No lugar de <CalendarIcon />, use:
// <MaterialCommunityIcons name="calendar" size={24} color="#bbb" />
// No lugar de <ClockIcon />, use:
// <MaterialCommunityIcons name="clock-outline" size={24} color="#bbb" />
// No lugar de <MapPinIcon />, use:
// <MaterialCommunityIcons name="map-marker" size={24} color="#bbb" />
// No lugar de <UserIcon />, use:
// <MaterialCommunityIcons name="account" size={24} color="#bbb" />
// No lugar de <CheckIcon />, use:
// <MaterialCommunityIcons name="car" size={24} color="#bbb" />
// No lugar de <FileTextIcon />, use:
// <MaterialCommunityIcons name="file-document-edit" size={24} color="#bbb" />


interface RelatorioScreenProps {
    token: string;
    onRelatorioCorrigido?: (relatorio: string) => void;
}

export const RelatorioScreen: React.FC<RelatorioScreenProps> = ({ token, onRelatorioCorrigido }) => {
    const [data, setData] = useState<Date | null>(null);
    const [hora, setHora] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [endereco, setEndereco] = useState('');
    const [colaborador, setColaborador] = useState('');
    const [relatorioBruto, setRelatorioBruto] = useState('');
    const [relatorioLimpo, setRelatorioLimpo] = useState('');
    const [loading, setLoading] = useState(false);
    const [vtr, setVtr] = useState('');
    const [colabSugestoes, setColabSugestoes] = useState<any[]>([]);
    const [colabLoading, setColabLoading] = useState(false);
    const colabTimeout = useRef<NodeJS.Timeout | null>(null);
    const [enderecoSugestoes, setEnderecoSugestoes] = useState<any[]>([]);
    const [enderecoLoading, setEnderecoLoading] = useState(false);
    const enderecoTimeout = useRef<NodeJS.Timeout | null>(null);

    const vtrOptions = [
        '',
        'VTR 03',
        'VTR 04',
        'VTR 05',
        'VTR 06',
        'VTR 07',
        'VTR 08',
        'VTR 09',
        'VTR 10',
        'VTR 11',
    ];

    // Função para buscar colaboradores conforme digita
    const handleBuscarColaboradores = (texto: string) => {
        setColaborador(texto);
        if (colabTimeout.current) clearTimeout(colabTimeout.current);
        if (!texto || texto.length < 2) {
            setColabSugestoes([]);
            return;
        }
        setColabLoading(true);
        colabTimeout.current = setTimeout(async () => {
            try {
                const resp = await buscarColaboradores(texto, token);
                setColabSugestoes(resp.colaboradores || []);
            } catch {
                setColabSugestoes([]);
            } finally {
                setColabLoading(false);
            }
        }, 350);
    };

    const handleAnalisar = async () => {
        if (!relatorioBruto.trim()) {
            Alert.alert('Atenção', 'Cole ou digite o relatório bruto.');
            return;
        }
        // Monta o texto com os campos preenchidos acima do relatório bruto
        const textoMontado = `
Data: ${data ? data.toLocaleDateString('pt-BR') : '[Preencher data]'}
Hora: ${hora ? hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '[Preencher hora]'}
Colaborador: ${colaborador || '[Preencher colaborador]'}
Endereço: ${endereco || '[Preencher endereço]'}
Viatura/VTR: ${vtr || '[Preencher viatura]'}
\n${relatorioBruto}`;
        setLoading(true);
        try {
            const response = await analisarRelatorio(token, textoMontado);
            console.log('Resposta da API:', response);
            if (response?.sucesso && response.dados) {
                const relatorioCorrigido = response.dados.relatorio_corrigido || response.dados.relatorio || response.relatorio_corrigido || response.relatorio;
                if (relatorioCorrigido) {
                    setRelatorioLimpo(relatorioCorrigido);
                    if (onRelatorioCorrigido) {
                        onRelatorioCorrigido(relatorioCorrigido);
                    }
                } else {
                    setRelatorioLimpo(JSON.stringify(response.dados, null, 2));
                }
                const { data_hora_ocorrencia, endereco_especifico, colaboradores_envolvidos } = response.dados;
                if (data_hora_ocorrencia) {
                    const [d, h] = data_hora_ocorrencia.split('T');
                    const [ano, mes, dia] = d.split('-');
                    const [horaStr, minStr] = h.split(':');
                    setData(new Date(Number(ano), Number(mes) - 1, Number(dia)));
                    setHora(new Date(0, 0, 0, Number(horaStr), Number(minStr)));
                }
                if (endereco_especifico) setEndereco(endereco_especifico);
                if (colaboradores_envolvidos?.length > 0) setColaborador(colaboradores_envolvidos[0]);
            } else {
                Alert.alert('Erro', response.message || 'Não foi possível analisar o relatório.');
            }
        } catch (e: any) {
            Alert.alert('Erro', e.message || 'Erro ao analisar relatório.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = () => {
        if (!relatorioLimpo) {
            Alert.alert('Atenção', 'Gere o relatório limpo antes de enviar.');
            return;
        }
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(relatorioLimpo)}`;
        const webUrl = `https://wa.me/?text=${encodeURIComponent(relatorioLimpo)}`;
        Linking.canOpenURL(whatsappUrl).then(supported => {
            if (supported) {
                Linking.openURL(whatsappUrl);
            } else {
                Linking.canOpenURL(webUrl).then(webSupported => {
                    if (webSupported) {
                        Linking.openURL(webUrl);
                    } else {
                        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
                    }
                });
            }
        });
    };

    const handleCopiar = () => {
        Clipboard.setString(relatorioLimpo);
        Alert.alert('Copiado', 'Relatório limpo copiado para a área de transferência.');
    };

    const handleBuscarEnderecos = (texto: string) => {
        setEndereco(texto);
        if (enderecoTimeout.current) clearTimeout(enderecoTimeout.current);
        if (!texto || texto.length < 2) {
            setEnderecoSugestoes([]);
            return;
        }
        setEnderecoLoading(true);
        enderecoTimeout.current = setTimeout(async () => {
            try {
                const resp = await buscarEnderecos(texto, token);
                setEnderecoSugestoes(resp.logradouros || []);
            } catch {
                setEnderecoSugestoes([]);
            } finally {
                setEnderecoLoading(false);
            }
        }, 350);
    };

    const openDatePicker = () => setShowDatePicker(true);
    const openTimePicker = () => setShowTimePicker(true);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Análise de Relatório</Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Data */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="calendar" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Data</Text>
                            {Platform.OS === 'web' ? (
                                <input
                                    type="date"
                                    value={data ? data.toISOString().substring(0, 10) : ''}
                                    onChange={e => setData(new Date(e.target.value))}
                                    style={{ ...styles.input, width: '100%' }}
                                />
                            ) : (
                                <TouchableOpacity onPress={openDatePicker} activeOpacity={0.7}>
                                    <Input
                                        placeholder="DD/MM/AAAA"
                                        value={data ? data.toLocaleDateString('pt-BR') : ''}
                                        editable={false}
                                        style={styles.input}
                                    />
                                </TouchableOpacity>
                            )}
                            {showDatePicker && Platform.OS !== 'web' && (
                                <DateTimePicker
                                    value={data || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(_, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setData(selectedDate);
                                    }}
                                />
                            )}
                        </View>
                    </View>

                    {/* Hora */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Hora</Text>
                            {Platform.OS === 'web' ? (
                                <input
                                    type="time"
                                    value={hora ? hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    onChange={e => {
                                        const [h, m] = e.target.value.split(':');
                                        const newDate = new Date();
                                        newDate.setHours(Number(h));
                                        newDate.setMinutes(Number(m));
                                        setHora(newDate);
                                    }}
                                    style={{ ...styles.input, width: '100%' }}
                                />
                            ) : (
                                <TouchableOpacity onPress={openTimePicker} activeOpacity={0.7}>
                                    <Input
                                        placeholder="HH:MM"
                                        value={hora ? hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        editable={false}
                                        style={styles.input}
                                    />
                                </TouchableOpacity>
                            )}
                            {showTimePicker && Platform.OS !== 'web' && (
                                <DateTimePicker
                                    value={hora || new Date()}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(_, selectedTime) => {
                                        setShowTimePicker(false);
                                        if (selectedTime) setHora(selectedTime);
                                    }}
                                />
                            )}
                        </View>
                    </View>

                    {/* Endereço */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="map-marker" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Endereço</Text>
                            <Input
                                placeholder="Ex: Rua Exemplo, 123"
                                value={endereco}
                                onChangeText={handleBuscarEnderecos}
                                style={styles.input}
                            />
                            {enderecoLoading && <Text style={{ color: colors.mutedText, fontSize: 13 }}>Buscando...</Text>}
                            {enderecoSugestoes.length > 0 && (
                                <View style={styles.sugestoesBox}>
                                    {enderecoSugestoes.map((e) => (
                                        <Text
                                            key={e.id}
                                            style={styles.sugestaoItem}
                                            onPress={() => {
                                                setEndereco(e.nome);
                                                setEnderecoSugestoes([]);
                                            }}
                                        >
                                            {e.nome}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Colaborador */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="account" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Colaborador/Responsável</Text>
                            <Input
                                placeholder="Nome do responsável"
                                value={colaborador}
                                onChangeText={handleBuscarColaboradores}
                                style={styles.input}
                                autoCorrect={false}
                                autoCapitalize="words"
                            />
                            {colabLoading && <Text style={{ color: colors.mutedText, fontSize: 13 }}>Buscando...</Text>}
                            {colabSugestoes.length > 0 && (
                                <View style={styles.sugestoesBox}>
                                    {colabSugestoes.map((c) => (
                                        <Text
                                            key={c.id}
                                            style={styles.sugestaoItem}
                                            onPress={() => {
                                                setColaborador(c.nome_completo);
                                                setColabSugestoes([]);
                                            }}
                                        >
                                            {c.nome_completo} {c.cargo ? `(${c.cargo})` : ''}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* VTR (mantido como Picker, mas estilizado para se parecer com input) */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            {/* Ícone para VTR, você pode escolher um adequado */}
                            <MaterialCommunityIcons name="car" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Viatura/VTR</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    selectedValue={vtr}
                                    onValueChange={setVtr}
                                    style={styles.picker}
                                    dropdownIconColor={colors.primaryBg}
                                >
                                    {vtrOptions.map(opt => (
                                        <Picker.Item key={opt} label={opt || 'Selecione'} value={opt} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Relatório Bruto */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="file-document-edit" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Relatório Bruto</Text>
                            <Input
                                placeholder="Cole ou digite o relatório bruto aqui..."
                                value={relatorioBruto}
                                onChangeText={setRelatorioBruto}
                                multiline
                                style={[styles.input, styles.multilineInput]}
                            />
                        </View>
                    </View>

                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title={loading ? 'Analisando...' : 'Analisar Relatório'}
                        onPress={handleAnalisar}
                        disabled={loading}
                        style={styles.analyzeButton}
                    />
                    {loading && <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />}
                </View>

                {relatorioLimpo && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>Relatório Limpo</Text>
                        <ScrollView horizontal>
                            <Text selectable style={styles.resultText}>{relatorioLimpo}</Text>
                        </ScrollView>
                        <View style={styles.resultButtons}>
                            <Button title="Copiar Relatório" onPress={handleCopiar} style={styles.resultButton} />
                            <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} style={styles.resultButton} />
                        </View>
                    </View>
                )}
            </ScrollView>
            <View style={styles.creditoBox}>
                <Text style={styles.creditoText}>Desenvolvido por Luis Eduardo Rodrigues Royo</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colors.primaryBg || '#E8E8E8', // Cor de fundo mais clara para o container principal
        flexGrow: 1,
    },
    header: {
        backgroundColor: colors.primaryBg || '#1E88E5', // Azul mais escuro para o cabeçalho
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0', // Fundo cinza claro para o círculo do ícone
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    icon: {
        color: colors.primaryBg || '#1E88E5', // Cor do ícone
    },
    inputGroupFlex: {
        flex: 1,
    },
    label: {
        color: '#555', // Cor do texto da label
        fontSize: 14,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F9F9F9', // Fundo mais claro para os inputs
        color: '#333',
        fontSize: 16,
        borderRadius: 10, // Bordas mais arredondadas
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0', // Borda sutil
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    sugestoesBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        maxHeight: 150,
        overflow: 'scroll',
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    sugestaoItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    pickerBox: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    picker: {
        width: '100%',
        height: 50, // Ajustado para ser mais consistente com os inputs
        color: '#333',
    },
    buttonContainer: {
        marginTop: 25,
        alignItems: 'center',
    },
    analyzeButton: {
        backgroundColor: colors.primaryBg || '#1E88E5', // Cor do botão principal
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    resultBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    resultTitle: {
        color: '#111',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    resultText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        marginBottom: 20,
    },
    resultButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    resultButton: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: colors.secondaryBg || '#4CAF50', // Cor para os botões de ação do resultado
        borderRadius: 10,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    creditoBox: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    creditoText: {
        color: '#777',
        fontSize: 12,
        fontStyle: 'italic',
    },
    // Removendo estilos não utilizados ou que não se encaixam no novo layout
    topoBox: { display: 'none' },
    institucionalBox: { display: 'none' },
    logoImg: { display: 'none' },
    institucionalMsg: { display: 'none' },
    bold: { display: 'none' },
    master: { display: 'none' },
    rowInputs: { display: 'none' }, // Este estilo foi substituído por inputRow
    acaoBox: { display: 'none' },
    acaoBtn: { display: 'none' },
});
