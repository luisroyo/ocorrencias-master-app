import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RelatorioStack } from './RelatorioStack';
import { OccurrencesStack } from './OccurrencesStack';
import { RondaStack } from './RondaStack';
import { ROUTES } from '../constants/routes';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC<{
    token: string;
    onRelatorioCorrigido: (relatorio: string) => void;
    onLogout?: () => Promise<void>;
}> = ({ token, onRelatorioCorrigido, onLogout }) => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                paddingBottom: 5,
                paddingTop: 5,
                height: 60,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 8,
            },
            tabBarActiveTintColor: colors.primaryBg || '#1e3a8a',
            tabBarInactiveTintColor: '#999',
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: 2,
            },
            tabBarIconStyle: {
                marginBottom: 2,
            }
        }}
    >
        <Tab.Screen
            name="RelatorioTab"
            options={{
                title: 'Relatório',
                tabBarIcon: ({ color, size, focused }) => (
                    <MaterialCommunityIcons
                        name={focused ? "file-document-edit" : "file-document-outline"}
                        size={size}
                        color={color}
                    />
                ),
            }}
        >
            {() => <RelatorioStack token={token} onRelatorioCorrigido={onRelatorioCorrigido} />}
        </Tab.Screen>
        <Tab.Screen
            name="RondaTab"
            options={{
                title: 'Ronda',
                tabBarIcon: ({ color, size, focused }) => (
                    <MaterialCommunityIcons
                        name={focused ? "map-marker" : "map-marker-outline"}
                        size={size}
                        color={color}
                    />
                ),
            }}
        >
            {() => <RondaStack token={token} />}
        </Tab.Screen>
        <Tab.Screen
            name="OccurrencesTab"
            options={{
                title: 'Ocorrências',
                tabBarIcon: ({ color, size, focused }) => (
                    <MaterialCommunityIcons
                        name={focused ? "format-list-bulleted" : "format-list-bulleted-type"}
                        size={size}
                        color={color}
                    />
                ),
            }}
        >
            {() => <OccurrencesStack token={token} />}
        </Tab.Screen>
    </Tab.Navigator>
); 