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

    const openDatePicker = () => setShowDatePicker(true);
    const openTimePicker = () => setShowTimePicker(true);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.topoBox}>
                    <Image source={require('../../logo_master.png')} style={styles.logoImg} resizeMode="contain" />
                    <View style={styles.institucionalBox}>
                        <Text style={styles.institucionalMsg}>É <Text style={styles.bold}>segurança</Text>.
                            É <Text style={styles.bold}>manutenção</Text>.
                            É <Text style={styles.bold}>sustentabilidade</Text>.
                            É <Text style={styles.master}>ASSOCIAÇÃO MASTER</Text></Text>
                    </View>
                </View>
                <Text style={styles.title}>Análise de Relatório</Text>
                {/* Data e Hora na mesma linha */}
                <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
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
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Endereço</Text>
                    <Input
                        placeholder="Ex: Rua Exemplo, 123"
                        value={endereco}
                        onChangeText={setEndereco}
                        style={styles.input}
                    />
                </View>

                {/* Colaborador e VTR na mesma linha */}
                <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
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
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Relatório Bruto</Text>
                    <Input
                        placeholder="Cole ou digite o relatório bruto aqui..."
                        value={relatorioBruto}
                        onChangeText={setRelatorioBruto}
                        multiline
                        style={[styles.input, styles.multilineInput]}
                    />
                </View>

                <View style={{ marginTop: 12 }}>
                    <Button
                        title={loading ? 'Analisando...' : 'Analisar Relatório'}
                        onPress={handleAnalisar}
                        disabled={loading}
                    />
                    {loading && <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />}
                </View>

                {relatorioLimpo && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>Relatório Limpo</Text>
                        <ScrollView horizontal>
                            <Text selectable style={styles.resultText}>{relatorioLimpo}</Text>
                        </ScrollView>
                        <Button title="Copiar Relatório" onPress={handleCopiar} />
                        <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} />
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
        backgroundColor: colors.primaryBg || '#0B1C26',
        flexGrow: 1,
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 28,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#ccc',
        fontSize: 15,
        marginBottom: 6,
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
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    resultBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginTop: 28,
        boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
    },
    resultTitle: {
        color: '#111',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '400',
    },
    sugestoesBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 2,
        borderWidth: 1,
        borderColor: colors.secondaryBg,
        maxHeight: 140,
        overflow: 'scroll',
        zIndex: 10,
        elevation: 3,
    },
    sugestaoItem: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        fontSize: 15,
        color: colors.headingText,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
    acaoBox: {
        flexDirection: 'row',
        gap: 8,
    },
    acaoBtn: {
        marginRight: 8,
        minWidth: 80,
        paddingHorizontal: 0,
    },
    rowInputs: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    pickerBox: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.secondaryBg,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 44,
        color: colors.headingText,
    },
    creditoBox: {
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 8,
    },
    creditoText: {
        color: '#444',
        fontSize: 13,
        fontStyle: 'italic',
    },
});
