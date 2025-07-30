import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RelatorioScreen } from '../screens/Relatorio';
import { ROUTES } from '../constants/routes';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();

export const RelatorioStack: React.FC<{ token: string; onRelatorioCorrigido: (relatorio: string) => void }> = ({ token, onRelatorioCorrigido }) => (
    <Stack.Navigator initialRouteName={ROUTES.RELATORIO}>
        <Stack.Screen
            name={ROUTES.RELATORIO}
            options={{
                title: 'Análise de Relatório',
                headerTitle: (props) => (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#003c3c', letterSpacing: 1 }}>
                            {typeof props.children === 'string' ? props.children : 'Análise de Relatório'}
                        </Text>
                    </View>
                ),
                headerStyle: { backgroundColor: '#fff' },
                headerTitleAlign: 'center',
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