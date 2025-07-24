import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RelatorioStack } from './RelatorioStack';
import { OccurrencesStack } from './OccurrencesStack';
import { ROUTES } from '../constants/routes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC<{ token: string; onRelatorioCorrigido: (relatorio: string) => void }> = ({ token, onRelatorioCorrigido }) => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
            name="RelatorioTab"
            options={{
                title: 'Relatório',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="file-document-edit" size={size} color={color} />
                ),
            }}
        >
            {() => <RelatorioStack token={token} onRelatorioCorrigido={onRelatorioCorrigido} />}
        </Tab.Screen>
        <Tab.Screen
            name="OccurrencesTab"
            options={{
                title: 'Ocorrências',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
                ),
            }}
        >
            {() => <OccurrencesStack token={token} />}
        </Tab.Screen>
    </Tab.Navigator>
); 