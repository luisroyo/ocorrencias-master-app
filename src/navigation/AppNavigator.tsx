import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { OccurrencesListScreen } from '../screens/OccurrencesListScreen';
import { OccurrenceDetailScreen } from '../screens/OccurrenceDetailScreen';
import { RelatorioScreen } from '../screens/RelatorioScreen';
import { Button } from '../components/Button';
import { View } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  OccurrencesList: undefined;
  OccurrenceDetail: { id: string };
  Relatorio: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="OccurrencesList" options={{ title: 'Ocorrências' }}>
          {({ navigation }) => (
            <View style={{ flex: 1 }}>
              <OccurrencesListScreen onSelect={id => setSelectedId(id)} />
              <Button
                title="Analisar Relatório"
                onPress={() => navigation.navigate('Relatorio')}
                style={{ margin: 16 }}
              />
            </View>
          )}
        </Stack.Screen>
        <Stack.Screen name="OccurrenceDetail" options={{ title: 'Detalhes da Ocorrência' }}>
          {() => selectedId ? <OccurrenceDetailScreen id={selectedId} onBack={() => setSelectedId(null)} /> : null}
        </Stack.Screen>
        <Stack.Screen name="Relatorio" options={{ title: 'Análise de Relatório' }}>
          {() => <RelatorioScreen token={token} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 