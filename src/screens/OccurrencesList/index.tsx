import React, { useEffect, useState } from 'react';
import { Text, FlatList, ActivityIndicator, View } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';
import { listarOcorrencias } from '../../services/ocorrencias';

export const OccurrencesListScreen: React.FC<{ onSelect: (id: string) => void; token?: string }> = ({ onSelect, token }) => {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const resp = await listarOcorrencias(token || '');
                setOcorrencias(resp.historico || []);
            } catch (e) {
                setError('Erro ao buscar ocorrências');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    return (
        <BaseScreen title="Ocorrências">
            {loading ? (
                <ActivityIndicator size="large" color={colors.primaryBg} style={{ marginTop: 32 }} />
            ) : error ? (
                <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 32 }}>{error}</Text>
            ) : (
                <FlatList
                    data={ocorrencias}
                    keyExtractor={item => String(item.id)}
                    renderItem={({ item }) => (
                        <Card>
                            <Text style={styles.occurrenceTitle}>{item.tipo || item.title}</Text>
                            <Text style={styles.occurrenceDate}>{item.data_hora_ocorrencia ? new Date(item.data_hora_ocorrencia).toLocaleString('pt-BR') : item.date}</Text>
                            <Text style={[styles.status, statusStyle(item.status)]}>{item.status}</Text>
                            <Button
                                title="Ver detalhes"
                                variant="success"
                                onPress={() => onSelect(String(item.id))}
                            />
                        </Card>
                    )}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
        </BaseScreen>
    );
};

function statusStyle(status: string) {
    switch (status) {
        case 'Resolvido':
            return { color: colors.success };
        case 'Em andamento':
            return { color: colors.warning };
        case 'Pendente':
            return { color: colors.danger };
        default:
            return { color: colors.mutedText };
    }
} 