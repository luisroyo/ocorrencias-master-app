import React from 'react';
import { Text } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import { BaseScreen } from '../../components/BaseScreen';

const mockDetails: Record<string, { title: string; description: string; status: string; date: string }> = {
    '1': {
        title: 'Queda de energia',
        description: 'Falta de energia elétrica em todo o prédio desde as 14h.',
        status: 'Pendente',
        date: '2024-06-01',
    },
    '2': {
        title: 'Vazamento de água',
        description: 'Vazamento identificado no 2º andar, próximo ao elevador.',
        status: 'Resolvido',
        date: '2024-05-30',
    },
    '3': {
        title: 'Barulho excessivo',
        description: 'Barulho vindo do apartamento 301 durante a madrugada.',
        status: 'Em andamento',
        date: '2024-05-28',
    },
};

export const OccurrenceDetailScreen: React.FC<{ id: string; onBack: () => void }> = ({ id, onBack }) => {
    const detail = mockDetails[id];
    if (!detail) return null;
    return (
        <BaseScreen title="Detalhes da Ocorrência">
            <Card>
                <Text style={styles.title}>{detail.title}</Text>
                <Text style={styles.date}>{detail.date}</Text>
                <Text style={[styles.status, statusStyle(detail.status)]}>{detail.status}</Text>
                <Text style={styles.description}>{detail.description}</Text>
                <Button title="Voltar" onPress={onBack} />
            </Card>
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