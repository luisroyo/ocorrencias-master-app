import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Alert, ScrollView, Platform,
    TouchableOpacity, Linking, Clipboard, KeyboardAvoidingView
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { analisarRelatorio } from '../services/relatorios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator } from 'react-native';

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
        const url = `https://wa.me/?text=${encodeURIComponent(relatorioLimpo)}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
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
                <Text style={styles.title}>Análise de Relatório</Text>

                <View style={styles.inputGroup}>
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

                <View style={styles.inputGroup}>
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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Endereço</Text>
                    <Input
                        placeholder="Ex: Rua Exemplo, 123"
                        value={endereco}
                        onChangeText={setEndereco}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Colaborador/Responsável</Text>
                    <Input
                        placeholder="Nome do responsável"
                        value={colaborador}
                        onChangeText={setColaborador}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Viatura/VTR</Text>
                    <Input
                        placeholder="Identificação da viatura"
                        value={vtr}
                        onChangeText={setVtr}
                        style={styles.input}
                    />
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
});
