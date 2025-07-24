import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OccurrencesListScreen } from '../screens/OccurrencesList';
import { OccurrenceDetailScreen } from '../screens/OccurrenceDetail';
import { Button } from '../components/Button';
import { View, Text } from 'react-native';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export const OccurrencesStack: React.FC<{ token: string }> = ({ token }) => {
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
                {props => <OccurrencesListScreen {...props} token={token} />}
            </Stack.Screen>
            <Stack.Screen name={ROUTES.OCORRENCIA_DETAIL} options={{ title: 'Detalhes da Ocorrência' }}>
                {props => <OccurrenceDetailScreen {...props} token={token} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}; 