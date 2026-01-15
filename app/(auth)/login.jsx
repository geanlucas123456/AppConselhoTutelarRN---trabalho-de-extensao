// app/login.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorBannerMessage, setErrorBannerMessage] = useState(null);
    const clearErrorBanner = () => setErrorBannerMessage(null);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Erro", "Por favor, insira e-mail e senha.");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Login bem-sucedido, redireciona para a tela principal (index)
            router.replace('/(app)'); 
        } catch (error) {
            //console.error("Erro ao fazer login:", error.message);
            setErrorBannerMessage("Credenciais inválidas ou erro de conexão. Tente novamente.");

            // 2. 🚨 Define um temporizador para limpar a mensagem após 3 segundos (3000ms)
            setTimeout(() => {
                setErrorBannerMessage(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 40} // Ajuste o offset para iOS
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Acesso ao Sistema</Text>
                {/* 🚨 NOVO: Renderização Condicional do Banner de Erro 🚨 */}
                {errorBannerMessage && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{errorBannerMessage}</Text>
                        <Button 
                            title="X" 
                            onPress={clearErrorBanner} // Permite fechar manualmente antes dos 3s
                            color="#dc3545"
                        />
                    </View>
                )}
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#4b0afdff" />
            ) : (
                <Button 
                    title="Entrar" 
                    onPress={handleLogin} 
                    color="#4b0afdff" 
                />
            )}
            
            {/* Opcional: Adicionar um botão de 'Cadastrar Novo Conselheiro' se necessário */}

        </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 40,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
        color: '#4b0afdff',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 20,
        borderRadius: 5,
        fontSize: 16,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical:100,
        padding: 20,
        // ... (Estilos do scroll)
    },
    errorBanner: {
        backgroundColor: '#f8d7da', // Cor de fundo suave (vermelho claro)
        borderColor: '#f5c6cb',      // Borda vermelha clara
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    errorText: {
        color: '#721c24', // Texto em vermelho escuro
        flexShrink: 1,      // Garante que o texto quebre a linha se for muito longo
        marginRight: 10,
        fontWeight: '600',
    },
    
});

