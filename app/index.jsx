// app/index.jsx  ← tela raiz da aplicação
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext'; // ajuste o caminho se necessário

export default function EntryScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Já logado? Vai direto pra home protegida
        router.replace('/(app)');
      } else {
        // Não logado? Vai pro login
        router.replace('/(auth)/login');
      }
    }
  }, [loading, user, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#4b0afdff" />
      <Text style={{ marginTop: 16 }}>
        {loading ? 'Verificando autenticação...' : 'Redirecionando...'}
      </Text>
    </View>
  );
}