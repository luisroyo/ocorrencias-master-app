import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { RelatorioCorrigidoStack } from './RelatorioCorrigidoStack';
import { LoginScreen } from '../screens/Login';

export const AppNavigator: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [relatorioCorrigido, setRelatorioCorrigido] = useState<string | null>(null);

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  if (relatorioCorrigido) {
    return <RelatorioCorrigidoStack relatorio={relatorioCorrigido} onVoltar={() => setRelatorioCorrigido(null)} />;
  }

  return (
    <NavigationContainer>
      <TabNavigator token={token} onRelatorioCorrigido={setRelatorioCorrigido} />
    </NavigationContainer>
  );
}; 