import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { styles } from './styles';

const mockOccurrences = [
    {
        id: '1',
        title: 'Queda de energia',
        status: 'Pendente',
        date: '2024-06-01',
    },
    {
        id: '2',
        title: 'Vazamento de água',
        status: 'Resolvido',
        date: '2024-05-30',
    },
    {
        id: '3',
        title: 'Barulho excessivo',
        status: 'Em andamento',
        date: '2024-05-28',
    },
];

export const OccurrencesListScreen: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ocorrências</Text>
            <FlatList
                data={mockOccurrences}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card>
                        <Text style={styles.occurrenceTitle}>{item.title}</Text>
                        <Text style={styles.occurrenceDate}>{item.date}</Text>
                        <Text style={[styles.status, statusStyle(item.status)]}>{item.status}</Text>
                        <Button
                            title="Ver detalhes"
                            variant="success"
                            onPress={() => onSelect(item.id)}
                        />
                    </Card>
                )}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
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