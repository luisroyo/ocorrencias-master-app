import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RelatorioStack } from './RelatorioStack';
import { OccurrencesStack } from './OccurrencesStack';
import { RelatorioCorrigidoStack } from './RelatorioCorrigidoStack';
import { LoginScreen } from '../screens/Login';
import { ROUTES } from '../constants/routes';

export const AppNavigator: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [relatorioCorrigido, setRelatorioCorrigido] = useState<string | null>(null);

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  if (relatorioCorrigido) {
    return <RelatorioCorrigidoStack relatorio={relatorioCorrigido} onVoltar={() => setRelatorioCorrigido(null)} />;
  }

  // Exemplo: você pode alternar entre stacks conforme a navegação global do app
  // Aqui, por simplicidade, mostramos o RelatorioStack como principal
  return (
    <NavigationContainer>
      <RelatorioStack token={token} onRelatorioCorrigido={setRelatorioCorrigido} />
      {/* Para navegação real entre stacks, use um Tab.Navigator ou lógica de navegação global */}
      {/* <OccurrencesStack /> */}
    </NavigationContainer>
  );
}; 