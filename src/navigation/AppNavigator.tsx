import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { RelatorioCorrigidoScreen } from '../screens/RelatorioCorrigido';
import { LoginScreen } from '../screens/Login';

export const AppNavigator: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [relatorioCorrigido, setRelatorioCorrigido] = useState<string | null>(null);

  const Stack = createNativeStackNavigator();

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
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 