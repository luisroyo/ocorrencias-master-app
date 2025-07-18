import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { OccurrencesListScreen } from '../screens/OccurrencesListScreen';
import { OccurrenceDetailScreen } from '../screens/OccurrenceDetailScreen';

export type RootStackParamList = {
    Login: undefined;
    OccurrencesList: undefined;
    OccurrenceDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!isLogged) {
        return <LoginScreen onLogin={() => setIsLogged(true)} />;
    }

    if (selectedId) {
        return <OccurrenceDetailScreen id={selectedId} onBack={() => setSelectedId(null)} />;
    }

    return <OccurrencesListScreen onSelect={setSelectedId} />;

    // Para navegação com React Navigation, descomente abaixo e ajuste as telas:
    /*
    return (
      <NavigationContainer>
        <Stack.Navigator>
          {!isLogged ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {() => <LoginScreen onLogin={() => setIsLogged(true)} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="OccurrencesList" options={{ title: 'Ocorrências' }}>
                {() => <OccurrencesListScreen onSelect={id => navigation.navigate('OccurrenceDetail', { id })} />}
              </Stack.Screen>
              <Stack.Screen name="OccurrenceDetail" options={{ title: 'Detalhes' }}>
                {({ route, navigation }) => (
                  <OccurrenceDetailScreen id={route.params.id} onBack={() => navigation.goBack()} />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
    */
}; 