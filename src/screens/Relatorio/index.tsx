import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, Alert, Platform, TouchableOpacity, Linking, Clipboard, ScrollView
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { analisarRelatorio } from '../../services/relatorios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator } from 'react-native';
import { AnimatedInput } from '../../components/AnimatedInput';
import { buscarColaboradores } from '../../services/colaboradores';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { buscarEnderecos } from '../../services/enderecos';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const colabTimeout = useRef<any>(null);
    const [enderecoSugestoes, setEnderecoSugestoes] = useState<any[]>([]);
    const [enderecoLoading, setEnderecoLoading] = useState(false);
    const enderecoTimeout = useRef<any>(null);

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

    const FORM_KEY = 'relatorio_form_state_v1';

    // Carregar estado salvo ao montar
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(FORM_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.data) setData(new Date(parsed.data));
                    if (parsed.hora) setHora(new Date(parsed.hora));
                    if (parsed.endereco) setEndereco(parsed.endereco);
                    if (parsed.colaborador) setColaborador(parsed.colaborador);
                    if (parsed.relatorioBruto) setRelatorioBruto(parsed.relatorioBruto);
                    if (parsed.vtr) setVtr(parsed.vtr);
                }
            } catch { }
        })();
    }, []);

    // Salvar estado sempre que algum campo mudar
    useEffect(() => {
        const timeout = setTimeout(() => {
            AsyncStorage.setItem(
                FORM_KEY,
                JSON.stringify({
                    data: data ? data.toISOString() : null,
                    hora: hora ? hora.toISOString() : null,
                    endereco,
                    colaborador,
                    relatorioBruto,
                    vtr,
                })
            );
        }, 400);
        return () => clearTimeout(timeout);
    }, [data, hora, endereco, colaborador, relatorioBruto, vtr]);

    // Função para limpar formulário
    const handleLimparFormulario = () => {
        Alert.alert(
            'Limpar Formulário',
            'Tem certeza que deseja limpar todos os campos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => {
                        setData(null);
                        setHora(null);
                        setEndereco('');
                        setColaborador('');
                        setRelatorioBruto('');
                        setRelatorioLimpo('');
                        setVtr('');
                        setColabSugestoes([]);
                        setEnderecoSugestoes([]);
                        AsyncStorage.removeItem(FORM_KEY);
                    }
                }
            ]
        );
    };

    // Limpar dados quando o componente for desmontado (logout)
    useEffect(() => {
        return () => {
            // Não limpar automaticamente ao sair da tela
            // Só limpar quando o usuário explicitamente quiser
        };
    }, []);

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

    // Limpar estado salvo ao enviar via WhatsApp
    const handleEnviarWhatsApp = () => {
        if (!relatorioLimpo) {
            Alert.alert('Atenção', 'Gere o relatório limpo antes de enviar.');
            return;
        }
        // NÃO limpa mais automaticamente - só quando o usuário quiser
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
        <BaseScreen subtitle="Preencha os dados abaixo">
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
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
                                    style={{
                                        backgroundColor: '#F9F9F9',
                                        color: '#333',
                                        fontSize: 16,
                                        borderRadius: 10,
                                        padding: '12px 15px',
                                        border: '1px solid #E0E0E0',
                                        width: '100%',
                                        marginBottom: 0,
                                        boxSizing: 'border-box',
                                        height: 48,
                                    }}
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
                                    style={{
                                        backgroundColor: '#F9F9F9',
                                        color: '#333',
                                        fontSize: 16,
                                        borderRadius: 10,
                                        padding: '12px 15px',
                                        border: '1px solid #E0E0E0',
                                        width: '100%',
                                        marginBottom: 0,
                                        boxSizing: 'border-box',
                                        height: 48,
                                    }}
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
                    <View style={styles.buttonRow}>
                        <Button
                            title={loading ? 'Analisando...' : 'Analisar Relatório'}
                            onPress={handleAnalisar}
                            disabled={loading}
                            style={styles.analyzeButton}
                        />
                        <Button
                            title="Limpar Formulário"
                            onPress={handleLimparFormulario}
                            style={styles.clearButton}
                            textStyle={styles.clearButtonText}
                        />
                    </View>
                    {loading && <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />}
                </View>
                {relatorioLimpo && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>Relatório Limpo</Text>
                        <Text selectable style={styles.resultText}>{relatorioLimpo}</Text>
                        <View style={styles.resultButtons}>
                            <Button title="Copiar Relatório" onPress={handleCopiar} style={styles.resultButton} />
                            <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} style={styles.resultButton} />
                        </View>
                    </View>
                )}
            </ScrollView>
        </BaseScreen>
    );
};
