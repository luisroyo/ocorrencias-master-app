import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OccurrencesListScreen } from '../screens/OccurrencesList';
import { OccurrenceDetailScreen } from '../screens/OccurrenceDetail';
import { Button } from '../components/Button';
import { View } from 'react-native';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export const OccurrencesStack: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <Stack.Navigator initialRouteName={ROUTES.OCORRENCIAS_LIST}>
            <Stack.Screen name={ROUTES.OCORRENCIAS_LIST} options={{ title: 'Ocorrências' }}>
                {({ navigation }) => (
                    <View style={{ flex: 1 }}>
                        <OccurrencesListScreen onSelect={id => setSelectedId(id)} />
                        <Button
                            title="Analisar Relatório"
                            onPress={() => navigation.navigate(ROUTES.RELATORIO)}
                            style={{ margin: 16 }}
                        />
                    </View>
                )}
            </Stack.Screen>
            <Stack.Screen name={ROUTES.OCORRENCIA_DETAIL} options={{ title: 'Detalhes da Ocorrência' }}>
                {() => selectedId ? <OccurrenceDetailScreen id={selectedId} onBack={() => setSelectedId(null)} /> : null}
            </Stack.Screen>
        </Stack.Navigator>
    );
}; 