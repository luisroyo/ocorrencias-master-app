import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RelatorioStack } from './RelatorioStack';
import { OccurrencesStack } from './OccurrencesStack';
import { ROUTES } from '../constants/routes';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC<{ token: string; onRelatorioCorrigido: (relatorio: string) => void }> = ({ token, onRelatorioCorrigido }) => (
    <Tab.Navigator>
        <Tab.Screen
            name={ROUTES.RELATORIO}
            options={{ title: 'Relatório' }}
        >
            {() => <RelatorioStack token={token} onRelatorioCorrigido={onRelatorioCorrigido} />}
        </Tab.Screen>
        <Tab.Screen
            name={ROUTES.OCORRENCIAS_LIST}
            options={{ title: 'Ocorrências' }}
            component={OccurrencesStack}
        />
    </Tab.Navigator>
); 