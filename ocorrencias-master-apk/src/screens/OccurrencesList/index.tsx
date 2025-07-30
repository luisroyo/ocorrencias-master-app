import React, { useEffect, useState } from 'react';
import { Text, FlatList, ActivityIndicator, View } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';
import { listarOcorrencias } from '../../services/ocorrencias';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

export const OccurrencesListScreen: React.FC<{ token?: string }> = ({ token }) => {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation();

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
        <BaseScreen>
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
                                onPress={() => navigation.navigate(ROUTES.OCORRENCIA_DETAIL, { id: String(item.id), token })}
                            />
                        </Card>
                    )}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                    style={{ flex: 1 }}
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