// AppConselhoTutelarRN/app/novo-acompanhamento.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NovoAcompanhamentoScreen() {
    const router = useRouter();
    // Pega o ID do registro principal (atendimento)
    const { id: atendimentoId, nome } = useLocalSearchParams(); 
    
    const [motivoRetorno, setMotivoRetorno] = useState('');
    const [acoesTomadas, setAcoesTomadas] = useState('');
    const [loading, setLoading] = useState(false);

    // Define o título da tela (Nome da Criança)
    /*Stack.setOptions({
        title: `Novo Acompanhamento para ${nome || 'Infante'}`,
    });
*/
    const handleRegister = async () => {
        console.log("Tentando salvar o acompanhamento com ID principal:", atendimentoId);
        if (!motivoRetorno || !acoesTomadas) {
            Alert.alert("Atenção", "Por favor, preencha o Motivo do Retorno e as Ações Tomadas.");
            return;
        }

        setLoading(true);
        try {
            const atendimentoDocRef = doc(db, 'atendimentos', atendimentoId);
            // 1. Define a referência para a subcoleção
            const acompanhamentoRef = collection(
                atendimentoDocRef, 
                'historico_acompanhamento'
            );

            // 2. Adiciona o novo documento de acompanhamento
            await addDoc(acompanhamentoRef, {
                motivoRetorno,
                acoesTomadas,
                dataAcompanhamento: serverTimestamp(),
            });

            // Use Alert.alert com callback para fechar
        Alert.alert("Sucesso", "Registro de acompanhamento salvo!", [
            {
                text: "OK",
                onPress: () => {
                    // 🚨 MUDANÇA CRÍTICA AQUI 🚨
                    // Em vez de router.back(), vamos para a Home (/)
                    // Assim, garantimos que a Home é o único ponto de volta.
                    setTimeout(() => {
                    router.replace('/(app)'); 
                    }, 150);
                }
            }
        ]);
            
        } catch (e) {
            console.error("Erro ao adicionar acompanhamento: ", e);
            Alert.alert("Erro", "Não foi possível salvar o registro.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b0afdff" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Editar Atendimento</Text>
            <Text style={styles.label}>Motivo do Retorno/Acompanhamento</Text>
            <TextInput 
                style={[styles.input, {textAlignVertical: 'top'}]}
                value={motivoRetorno} 
                onChangeText={setMotivoRetorno}
                multiline
            />
            
            <Text style={styles.label}>Ações Tomadas / Encaminhamentos</Text>
            <TextInput 
                style={[styles.input, {textAlignVertical: 'top'}]}
                value={acoesTomadas} 
                onChangeText={setAcoesTomadas}
                multiline
                numberOfLines={4}
            />

            <Button title="Registrar Acompanhamento" onPress={handleRegister} color="#007bff" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#444' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        minHeight: 80,
        textAlignVertical: 'top',   // ← solução principal aqui!
        fontSize: 16,               // melhora legibilidade
        lineHeight: 24,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#4b0afdff',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});