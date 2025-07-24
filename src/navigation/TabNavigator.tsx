import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RelatorioStack } from './RelatorioStack';
import { OccurrencesStack } from './OccurrencesStack';
import { ROUTES } from '../constants/routes';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC<{ token: string; onRelatorioCorrigido: (relatorio: string) => void }> = ({ token, onRelatorioCorrigido }) => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
            name="RelatorioTab"
            options={{ title: 'Relatório' }}
        >
            {() => <RelatorioStack token={token} onRelatorioCorrigido={onRelatorioCorrigido} />}
        </Tab.Screen>
        <Tab.Screen
            name="OccurrencesTab"
            options={{ title: 'Ocorrências' }}
            component={OccurrencesStack}
        />
    </Tab.Navigator>
); 