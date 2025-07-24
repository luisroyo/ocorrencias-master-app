import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RelatorioScreen } from '../screens/Relatorio';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export const RelatorioStack: React.FC<{ token: string; onRelatorioCorrigido: (relatorio: string) => void }> = ({ token, onRelatorioCorrigido }) => (
    <Stack.Navigator initialRouteName={ROUTES.RELATORIO}>
        <Stack.Screen
            name={ROUTES.RELATORIO}
            options={{
                title: '',
                headerStyle: { backgroundColor: '#f8f8f8' },
                headerTitle: () => null,
            }}
        >
            {() => (
                <RelatorioScreen
                    token={token}
                    onRelatorioCorrigido={onRelatorioCorrigido}
                />
            )}
        </Stack.Screen>
    </Stack.Navigator>
); 