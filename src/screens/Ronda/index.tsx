import React, { useState, useEffect } from 'react';
import {
    View, Text, Alert, TouchableOpacity, Linking, ScrollView, ActivityIndicator
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { BaseScreen } from '../../components/BaseScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    verificarRondaEmAndamento,
    iniciarRonda,
    finalizarRonda,
    atualizarRonda,
    gerarRelatorioRonda,
    enviarRelatorioWhatsApp,
    listarRondasDoDia,
    Ronda,
    RondaEmAndamento
} from '../../services/rondas';
import { buscarColaboradores } from '../../services/colaboradores';
import { buscarEnderecos } from '../../services/enderecos';
import { styles } from './styles';

interface RondaScreenProps {
    token: string;
}

export const RondaScreen: React.FC<RondaScreenProps> = ({ token }) => {
    const [data, setData] = useState<Date>(new Date());
    const [condominio, setCondominio] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const [escalaPlantao, setEscalaPlantao] = useState('06h às 18h');
    const [observacoes, setObservacoes] = useState('');
    const [loading, setLoading] = useState(false);
    const [rondaEmAndamento, setRondaEmAndamento] = useState<RondaEmAndamento | null>(null);
    const [rondasDoDia, setRondasDoDia] = useState<Ronda[]>([]);
    const [relatorioGerado, setRelatorioGerado] = useState('');
    const [condominioId, setCondominioId] = useState<number | null>(null);
    const [supervisorId, setSupervisorId] = useState<number | null>(null);

    // Estados para sugestões
    const [condominioSugestoes, setCondominioSugestoes] = useState<any[]>([]);
    const [supervisorSugestoes, setSupervisorSugestoes] = useState<any[]>([]);
    const [condominioLoading, setCondominioLoading] = useState(false);
    const [supervisorLoading, setSupervisorLoading] = useState(false);

    const escalaOptions = [
        '06h às 18h',
        '18h às 06h',
        '12h às 00h',
        '00h às 12h'
    ];

    // Verificar ronda em andamento ao carregar
    useEffect(() => {
        if (condominioId) {
            verificarRondaAtual();
        }
    }, [condominioId]);

    const verificarRondaAtual = async () => {
        if (!condominioId) return;

        try {
            const resultado = await verificarRondaEmAndamento(token, condominioId);
            setRondaEmAndamento(resultado);
        } catch (error) {
            console.error('Erro ao verificar ronda em andamento:', error);
        }
    };

    const handleBuscarCondominios = async (texto: string) => {
        setCondominio(texto);
        if (!texto || texto.length < 2) {
            setCondominioSugestoes([]);
            return;
        }

        setCondominioLoading(true);
        try {
            const resp = await buscarEnderecos(texto, token);
            setCondominioSugestoes(resp.logradouros || []);
        } catch {
            setCondominioSugestoes([]);
        } finally {
            setCondominioLoading(false);
        }
    };

    const handleBuscarSupervisores = async (texto: string) => {
        setSupervisor(texto);
        if (!texto || texto.length < 2) {
            setSupervisorSugestoes([]);
            return;
        }

        setSupervisorLoading(true);
        try {
            const resp = await buscarColaboradores(texto, token);
            setSupervisorSugestoes(resp.colaboradores || []);
        } catch {
            setSupervisorSugestoes([]);
        } finally {
            setSupervisorLoading(false);
        }
    };

    const handleIniciarRonda = async () => {
        if (!condominioId) {
            Alert.alert('Atenção', 'Selecione um condomínio.');
            return;
        }

        if (rondaEmAndamento?.em_andamento) {
            Alert.alert('Atenção', 'Já existe uma ronda em andamento para este condomínio.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await iniciarRonda(token, {
                condominio_id: condominioId,
                data_plantao: data.toISOString().split('T')[0],
                escala_plantao: escalaPlantao,
                supervisor_id: supervisorId
            });

            if (resultado.sucesso) {
                Alert.alert('Sucesso', 'Ronda iniciada com sucesso!');
                await verificarRondaAtual();
            } else {
                Alert.alert('Erro', resultado.message || 'Erro ao iniciar ronda.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao iniciar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizarRonda = async () => {
        if (!rondaEmAndamento?.ronda?.id) {
            Alert.alert('Atenção', 'Nenhuma ronda em andamento encontrada.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await finalizarRonda(token, rondaEmAndamento.ronda.id);

            if (resultado.sucesso) {
                Alert.alert('Sucesso', 'Ronda finalizada com sucesso!');
                await verificarRondaAtual();
            } else {
                Alert.alert('Erro', resultado.message || 'Erro ao finalizar ronda.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao finalizar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleAtualizarRonda = async () => {
        if (!rondaEmAndamento?.ronda?.id) {
            Alert.alert('Atenção', 'Nenhuma ronda em andamento encontrada.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await atualizarRonda(token, rondaEmAndamento.ronda.id, {
                observacoes: observacoes,
                escala_plantao: escalaPlantao
            });

            if (resultado.sucesso) {
                Alert.alert('Sucesso', 'Ronda atualizada com sucesso!');
                setObservacoes('');
            } else {
                Alert.alert('Erro', resultado.message || 'Erro ao atualizar ronda.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao atualizar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleGerarRelatorio = async () => {
        if (!condominioId) {
            Alert.alert('Atenção', 'Selecione um condomínio.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await gerarRelatorioRonda(token, condominioId, data.toISOString().split('T')[0]);

            if (resultado.sucesso && resultado.relatorio) {
                setRelatorioGerado(resultado.relatorio);
            } else {
                Alert.alert('Erro', resultado.message || 'Erro ao gerar relatório.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao gerar relatório.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async () => {
        if (!relatorioGerado) {
            Alert.alert('Atenção', 'Gere o relatório antes de enviar.');
            return;
        }

        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(relatorioGerado)}`;
        const webUrl = `https://wa.me/?text=${encodeURIComponent(relatorioGerado)}`;

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

    const handleCopiarRelatorio = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(relatorioGerado);
            Alert.alert('Copiado', 'Relatório copiado para a área de transferência.');
        } else {
            Alert.alert('Erro', 'Não foi possível copiar o relatório.');
        }
    };

    return (
        <BaseScreen subtitle="Controle de Rondas">
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
                <View style={styles.formContainer}>
                    {/* Data */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="calendar" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Data do Plantão</Text>
                            <input
                                type="date"
                                value={data.toISOString().substring(0, 10)}
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
                        </View>
                    </View>

                    {/* Condomínio */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="office-building" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Condomínio</Text>
                            <Input
                                placeholder="Nome do condomínio"
                                value={condominio}
                                onChangeText={handleBuscarCondominios}
                                style={styles.input}
                            />
                            {condominioLoading && <Text style={{ color: colors.mutedText, fontSize: 13 }}>Buscando...</Text>}
                            {condominioSugestoes.length > 0 && (
                                <View style={styles.sugestoesBox}>
                                    {condominioSugestoes.map((c) => (
                                        <Text
                                            key={c.id}
                                            style={styles.sugestaoItem}
                                            onPress={() => {
                                                setCondominio(c.nome);
                                                setCondominioId(c.id);
                                                setCondominioSugestoes([]);
                                            }}
                                        >
                                            {c.nome}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Supervisor */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="account-tie" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Supervisor</Text>
                            <Input
                                placeholder="Nome do supervisor"
                                value={supervisor}
                                onChangeText={handleBuscarSupervisores}
                                style={styles.input}
                            />
                            {supervisorLoading && <Text style={{ color: colors.mutedText, fontSize: 13 }}>Buscando...</Text>}
                            {supervisorSugestoes.length > 0 && (
                                <View style={styles.sugestoesBox}>
                                    {supervisorSugestoes.map((s) => (
                                        <Text
                                            key={s.id}
                                            style={styles.sugestaoItem}
                                            onPress={() => {
                                                setSupervisor(s.nome_completo);
                                                setSupervisorId(s.id);
                                                setSupervisorSugestoes([]);
                                            }}
                                        >
                                            {s.nome_completo} {s.cargo ? `(${s.cargo})` : ''}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Escala */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Escala do Plantão</Text>
                            <select
                                value={escalaPlantao}
                                onChange={e => setEscalaPlantao(e.target.value)}
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
                            >
                                {escalaOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </View>
                    </View>

                    {/* Observações */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="note-text" size={24} color="#bbb" />
                        </View>
                        <View style={styles.inputGroupFlex}>
                            <Text style={styles.label}>Observações</Text>
                            <textarea
                                placeholder="Observações sobre a ronda..."
                                value={observacoes}
                                onChange={e => setObservacoes(e.target.value)}
                                style={{
                                    backgroundColor: '#F9F9F9',
                                    color: '#333',
                                    fontSize: 16,
                                    borderRadius: 10,
                                    padding: '12px 15px',
                                    border: '1px solid #E0E0E0',
                                    width: '100%',
                                    minHeight: 80,
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Status da Ronda */}
                {rondaEmAndamento && (
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusTitle}>
                            Status da Ronda: {rondaEmAndamento.em_andamento ? 'Em Andamento' : 'Nenhuma Ronda Ativa'}
                        </Text>
                        {rondaEmAndamento.ronda && (
                            <Text style={styles.statusText}>
                                Iniciada em: {new Date(rondaEmAndamento.ronda.inicio).toLocaleString('pt-BR')}
                            </Text>
                        )}
                    </View>
                )}

                {/* Botões de Controle */}
                <View style={styles.buttonContainer}>
                    <View style={styles.buttonRow}>
                        {!rondaEmAndamento?.em_andamento ? (
                            <Button
                                title={loading ? 'Iniciando...' : 'Iniciar Ronda'}
                                onPress={handleIniciarRonda}
                                disabled={loading}
                                style={styles.startButton}
                            />
                        ) : (
                            <Button
                                title={loading ? 'Finalizando...' : 'Finalizar Ronda'}
                                onPress={handleFinalizarRonda}
                                disabled={loading}
                                style={styles.stopButton}
                            />
                        )}

                        {rondaEmAndamento?.em_andamento && (
                            <Button
                                title="Atualizar Ronda"
                                onPress={handleAtualizarRonda}
                                disabled={loading}
                                style={styles.updateButton}
                            />
                        )}
                    </View>

                    <Button
                        title={loading ? 'Gerando...' : 'Gerar Relatório'}
                        onPress={handleGerarRelatorio}
                        disabled={loading}
                        style={styles.reportButton}
                    />

                    {loading && <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />}
                </View>

                {/* Relatório Gerado */}
                {relatorioGerado && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>Relatório de Rondas</Text>
                        <pre style={{
                            color: '#333',
                            fontSize: 16,
                            lineHeight: '22px',
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-line',
                            margin: 0,
                            padding: 0,
                            background: 'none',
                            border: 'none',
                        }}>{relatorioGerado}</pre>
                        <View style={styles.resultButtons}>
                            <Button title="Copiar Relatório" onPress={handleCopiarRelatorio} style={styles.resultButton} />
                            <Button title="Enviar via WhatsApp" onPress={handleEnviarWhatsApp} style={styles.resultButton} />
                        </View>
                    </View>
                )}
            </ScrollView>
        </BaseScreen>
    );
}; 