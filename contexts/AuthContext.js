// app/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Log para saber se o useEffect está rodando
        console.log("AuthContext: Iniciando listener de estado de autenticação.");

        // Adiciona uma verificação simples:
        if (!auth) {
            console.error("AuthContext: O objeto 'auth' do Firebase é nulo ou não está definido.");
            setLoading(false);
            return;
        }

        // Escuta as mudanças no estado de autenticação (logar/deslogar)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(`AuthContext: Estado alterado. User: ${currentUser ? 'LOGADO' : 'DESLOGADO'}`);
            setUser(currentUser);
            setLoading(false); // Define como false APENAS quando o estado de auth for resolvido
        });

        // Limpa o listener
        return () => unsubscribe();
    // A dependência vazia [] garante que ele roda apenas na montagem
    }, []);
if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b0afdff" />
            </View>
        );
    }
    // Exporta o user e o loading.
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    // 2. Adicione esta verificação crucial!
    // Se o contexto ainda é o valor inicial padrão (Undefined), lança um erro útil.
    if (context === undefined) { 
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
// 🛑 DEFINIÇÃO DOS ESTILOS:
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5', 
    },
});