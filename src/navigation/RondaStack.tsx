import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RondaScreen } from '../screens/Ronda';
import { ROUTES } from '../constants/routes';

const Stack = createStackNavigator();

export const RondaStack: React.FC<{ token: string }> = ({ token }) => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
        }}
    >
        <Stack.Screen
            name={ROUTES.RONDA}
            component={RondaScreen}
            initialParams={{ token }}
        />
    </Stack.Navigator>
); 