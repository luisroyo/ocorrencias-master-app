import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { analisarRelatorio } from '../services/relatorios';
import { Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RelatorioScreenProps {
    token: string;
}

export const RelatorioScreen: React.FC<RelatorioScreenProps> = ({ token }) => {
    const [data, setData] = useState<Date | null>(null);
    const [hora, setHora] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [endereco, setEndereco] = useState('');
    const [colaborador, setColaborador] = useState('');
    const [relatorioBruto, setRelatorioBruto] = useState('');
    const [relatorioLimpo, setRelatorioLimpo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalisar = async () => {
        if (!relatorioBruto.trim()) {
            Alert.alert('Atenção', 'Cole ou digite o relatório bruto.');
            return;
        }
        setLoading(true);
        try {
            const response = await analisarRelatorio(token, relatorioBruto);
            if (response && response.sucesso && response.dados) {
                // Preenche campos se vierem do backend
                if (response.dados.data_hora_ocorrencia) {
                    const [d, h] = response.dados.data_hora_ocorrencia.split('T');
                    const [ano, mes, dia] = d.split('-');
                    const [horaStr, minStr] = h.split(':');
                    setData(new Date(Number(ano), Number(mes) - 1, Number(dia)));
                    setHora(new Date(0, 0, 0, Number(horaStr), Number(minStr)));
                }
                if (response.dados.endereco_especifico) setEndereco(response.dados.endereco_especifico);
                if (response.dados.colaboradores_envolvidos && response.dados.colaboradores_envolvidos.length > 0) setColaborador(response.dados.colaboradores_envolvidos[0]);
                setRelatorioLimpo(JSON.stringify(response.dados, null, 2));
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

    // Funções para abrir os pickers
    const openDatePicker = () => setShowDatePicker(true);
    const openTimePicker = () => setShowTimePicker(true);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Análise de Relatório</Text>
            <TouchableOpacity onPress={openDatePicker} activeOpacity={0.7}>
                <Input
                    placeholder="Data (DD/MM/AAAA)"
                    value={data ? data.toLocaleDateString('pt-BR') : ''}
                    editable={false}
                    pointerEvents="none"
                />
            </TouchableOpacity>
            {showDatePicker && (
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
            <TouchableOpacity onPress={openTimePicker} activeOpacity={0.7}>
                <Input
                    placeholder="Hora (HH:MM)"
                    value={hora ? hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    editable={false}
                    pointerEvents="none"
                />
            </TouchableOpacity>
            {showTimePicker && (
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
            <Input
                placeholder="Endereço"
                value={endereco}
                onChangeText={setEndereco}
            />
            <Input
                placeholder="Colaborador/Responsável"
                value={colaborador}
                onChangeText={setColaborador}
            />
            <Input
                placeholder="Cole ou digite o relatório bruto aqui..."
                value={relatorioBruto}
                onChangeText={setRelatorioBruto}
                multiline
                style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
            <Button
                title={loading ? 'Analisando...' : 'Analisar Relatório'}
                onPress={handleAnalisar}
                disabled={loading}
            />
            {relatorioLimpo ? (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>Relatório Limpo</Text>
                    <ScrollView horizontal>
                        <Text selectable style={styles.resultText}>{relatorioLimpo}</Text>
                    </ScrollView>
                    <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} />
                </View>
            ) : null}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: colors.primaryBg,
        flexGrow: 1,
    },
    title: {
        color: colors.headingText,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    resultBox: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 16,
        marginTop: 24,
    },
    resultTitle: {
        color: colors.headingText,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    resultText: {
        color: colors.headingText,
        fontSize: 16,
    },
}); 