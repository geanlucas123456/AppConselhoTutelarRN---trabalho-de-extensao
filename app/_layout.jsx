// app/_layout.jsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase'; // só se precisar usar auth diretamente aqui

// Impede que o splash suma automaticamente
SplashScreen.preventAutoHideAsync();

function AppRouter() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {
        // erro silencioso no hideAsync não deve travar o app
      });
    }
  }, [loading]);

  // Enquanto está verificando autenticação → mostra loading
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4b0afdff" />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tela de login - só aparece se NÃO estiver logado */}
      <Stack.Screen
        name="(auth)/login"
        options={{
          headerShown: false,
        }}
      />

      {/* Grupo protegido - só aparece se estiver logado */}
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />

      {/* index na raiz - redireciona dependendo do estado de auth */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

// Componente raiz
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});