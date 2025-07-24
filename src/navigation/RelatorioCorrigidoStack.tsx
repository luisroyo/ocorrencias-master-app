import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RelatorioCorrigidoScreen } from '../screens/RelatorioCorrigido';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export const RelatorioCorrigidoStack: React.FC<{ relatorio: string; onVoltar: () => void }> = ({ relatorio, onVoltar }) => (
    <Stack.Navigator initialRouteName={ROUTES.RELATORIO_CORRIGIDO}>
        <Stack.Screen
            name={ROUTES.RELATORIO_CORRIGIDO}
            options={{ title: 'Relatório Corrigido' }}
        >
            {() => (
                <RelatorioCorrigidoScreen relatorio={relatorio} onVoltar={onVoltar} />
            )}
        </Stack.Screen>
    </Stack.Navigator>
); 