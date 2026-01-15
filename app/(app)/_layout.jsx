// app/(app)/_layout.jsx
import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebase';

export default function ProtectedLayout() {
  

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      alert('Erro ao sair: ' + error.message);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#4b0afdff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Telas protegidas - nomes únicos! */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Seja bem-vindo(a)',
          headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout}
            style={{
              backgroundColor: '#dc3545',          // ← fundo vermelho
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              marginRight: 10,                     // espaço da borda direita
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Sair
            </Text>
          </TouchableOpacity>
        ),
         }} 
      />
      <Stack.Screen 
        name="adicionar" 
        options={{ title: '' }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ title: '' }} 
      />
      <Stack.Screen 
      name="lista-diversos" 
      options={{ title: '' }} 
      />
      <Stack.Screen 
      name="tipo-atendimento" 
      options={{ title: '' }} 
      />
      <Stack.Screen 
    name="adicionar-diverso" 
    options={{ title: '' }} 
  />
  <Stack.Screen 
    name="novo-acompanhamento" 
    options={{ title: '' }} 
  />
<Stack.Screen 
    name="busca-atendimentos" 
    options={{ title: '' }} 
  />
  <Stack.Screen 
    name="lista-denuncias" 
    options={{ title: '' }} 
  />
  <Stack.Screen 
    name="adicionar-denuncia" 
    options={{ title: '' }} 
  />

      </Stack>
  );
}