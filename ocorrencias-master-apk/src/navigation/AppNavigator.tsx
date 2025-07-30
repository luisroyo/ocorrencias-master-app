import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { RelatorioCorrigidoScreen } from '../screens/RelatorioCorrigido';
import { LoginScreen } from '../screens/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppNavigator: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [relatorioCorrigido, setRelatorioCorrigido] = useState<string | null>(null);

  const Stack = createNativeStackNavigator();

  // Função para fazer logout e limpar dados
  const handleLogout = async () => {
    // Limpar dados do formulário quando fizer logout
    await AsyncStorage.removeItem('relatorio_form_state_v1');
    setToken(null);
    setRelatorioCorrigido(null);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLogin={setToken} />}
          </Stack.Screen>
        ) : relatorioCorrigido ? (
          <Stack.Screen name="RelatorioCorrigido">
            {() => (
              <RelatorioCorrigidoScreen
                relatorio={relatorioCorrigido}
                onVoltar={() => setRelatorioCorrigido(null)}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {() => (
              <TabNavigator
                token={token}
                onRelatorioCorrigido={setRelatorioCorrigido}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 