import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OccurrencesListScreen } from '../screens/OccurrencesList';
import { OccurrenceDetailScreen } from '../screens/OccurrenceDetail';
import { Button } from '../components/Button';
import { View, Text } from 'react-native';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export const OccurrencesStack: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <Stack.Navigator initialRouteName={ROUTES.OCORRENCIAS_LIST}>
            <Stack.Screen
                name={ROUTES.OCORRENCIAS_LIST}
                options={{
                    headerTitle: () => (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#003c3c', letterSpacing: 1 }}>Ocorrências</Text>
                        </View>
                    ),
                    headerStyle: { backgroundColor: '#fff' },
                    headerTitleAlign: 'center',
                }}
            >
                {() => (
                    <OccurrencesListScreen onSelect={id => setSelectedId(id)} />
                )}
            </Stack.Screen>
            <Stack.Screen name={ROUTES.OCORRENCIA_DETAIL} options={{ title: 'Detalhes da Ocorrência' }}>
                {() => selectedId ? <OccurrenceDetailScreen id={selectedId} onBack={() => setSelectedId(null)} /> : null}
            </Stack.Screen>
        </Stack.Navigator>
    );
}; 