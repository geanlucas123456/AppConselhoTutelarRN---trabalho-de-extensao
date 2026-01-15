import { Stack } from 'expo-router';

export default function DenunciaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#4b0afdff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: '',
          headerBackTitleVisible: false, // esconde "Back"
        })}
      />
    </Stack>
  );
}