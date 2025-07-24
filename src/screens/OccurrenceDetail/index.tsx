import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';
import { detalheOcorrencia } from '../../services/ocorrencias';
import { useRoute, useNavigation } from '@react-navigation/native';

export const OccurrenceDetailScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id, token } = route.params as { id: string; token: string };
    const [detail, setDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDetail() {
            setLoading(true);
            setError(null);
            try {
                const resp = await detalheOcorrencia(token || '', Number(id));
                setDetail(resp);
            } catch (e) {
                setError('Erro ao buscar detalhes da ocorrência');
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [id, token]);

    return (
        <BaseScreen title="Detalhes da Ocorrência">
            {loading ? (
                <ActivityIndicator size="large" color={colors.primaryBg} style={{ marginTop: 32 }} />
            ) : error ? (
                <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 32 }}>{error}</Text>
            ) : detail ? (
                <Card>
                    <Text style={styles.title}>{detail.tipo || detail.title}</Text>
                    <Text style={styles.date}>{detail.data_hora_ocorrencia ? new Date(detail.data_hora_ocorrencia).toLocaleString('pt-BR') : detail.date}</Text>
                    <Text style={[styles.status, statusStyle(detail.status)]}>{detail.status}</Text>
                    <Text style={styles.description}>{detail.relatorio_final || detail.description}</Text>
                    <Button title="Voltar" onPress={() => navigation.goBack()} />
                </Card>
            ) : null}
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