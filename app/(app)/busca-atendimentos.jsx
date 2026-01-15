// app/(app)/consulta-registros.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

export default function ConsultaRegistros() {
  const { user } = useAuth();
  const [atendimentos, setAtendimentos] = useState([]);
  const [loadingData, setLoadingData] = useState(true); 
  const [searchText, setSearchText] = useState ('');

  useEffect(() => {        
          
          // Se o usuário ainda não foi carregado pelo Contexto (o que não deve acontecer, mas por segurança)
          if (!user) {
              //console.warn("Usuário ainda não disponível no Contexto. Esperando...");
              // O loadingData permanece true, e o ActivityIndicator é exibido.
              return;
              
          }
  
          console.log("-> 1. Usuário do Contexto OK. Iniciando escuta do Firestore...");
          setLoadingData(true); 
          
          const q = query(
              collection(db, 'atendimentos'),
              orderBy('dataRegistro', 'desc') 
          );
  
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
              console.log("-> 2. onSnapshot SUCESSO! Documentos recebidos:", querySnapshot.docs.length); 
              
              const listaAtendimentos = [];
              querySnapshot.forEach((doc) => {
                  listaAtendimentos.push({
                      id: doc.id,
                      ...doc.data(),
                      // Garante que o dataRegistro é formatado de forma segura
                      dataRegistro: doc.data().dataRegistro?.toDate()
                      ? doc.data().dataRegistro.toDate().toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                      })
                      : 'Data Desconhecida'
                  });
              });
  
              setAtendimentos(listaAtendimentos);
              setLoadingData(false); 
          }, (error) => {
              console.log("-> 2. onSnapshot ERRO. Código:", error.code, "Mensagem:", error.message);
   
              // Mostra o erro e garante que o carregamento pare
              Alert.alert(
                  "Erro de Permissão", 
                  `Não foi possível carregar os dados. Código: ${error.code}. Verifique as Regras de Segurança ou o status de sua conexão.`,
                  [{ text: "OK" }]
              );
              
              setAtendimentos([]); // Limpa a lista em caso de falha
              setLoadingData(false);
          });
  
          return () => unsubscribe();
          
      // 🛑 CHAVE 3: O useEffect só roda quando o objeto 'user' do contexto muda (entra ou sai).
      }, [user]); 

  // Filtra os registros com base na busca (nome ou motivo)
  const filteredAtendimentos = atendimentos.filter((atendimento) => {
  const search = searchText.toLowerCase().trim();
  if (!search) return true;

  const fields = [
    atendimento.nomeCrianca,
    atendimento.motivo,
    atendimento.cpf,
    atendimento.filiacao1,
    atendimento.filiacao2,
    atendimento.dataRegistro?.toDate?.()?.toLocaleDateString('pt-BR'),
  ];

  return fields.some(field => 
    field && typeof field === 'string' && field.toLowerCase().includes(search)
  );
});


  console.log(`[DEBUG RENDER] Loading Data: ${loadingData}, Atendimentos Count: ${atendimentos.length}`);
      
      // 🛑 Renderiza o ActivityIndicator se estiver carregando os dados.
      if (loadingData) { 
          return (
              <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4b0afdff" />
                  <Text>Carregando atendimentos...</Text>
          </View>
      );
  }
      
      // 🛑 Renderiza o conteúdo principal se os dados carregaram (mesmo que vazios)
      return (
        
          
          <View style={styles.fullContainer}> 

            <Text style={styles.header}>Atendimentos de violação de direitos</Text>

              <View style={styles.searchContainer}>
                  <TextInput
                      style={styles.searchInput}
                      placeholder="🔍 Buscar por nome, CPF ou filiação..."
                      value={searchText}
                      onChangeText={setSearchText}
                  />
              </View>
  
              {atendimentos.length === 0 && !searchText ? (
                  <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Nenhum atendimento registrado ainda.</Text>
                      <Text>Clique no botão acima para começar!</Text>
                  </View>
              ) : (
                  <ScrollView contentContainerStyle={styles.listContainer}>
                      {filteredAtendimentos.length === 0 && searchText ? (
                          <View style={styles.emptyContainer}>
                              <Text style={styles.emptyText}>Nenhum resultado encontrado para "{searchText}".</Text>
                          </View>
                      ) : (
                          filteredAtendimentos.map((atendimento) => (
                              <Pressable 
                                  key={atendimento.id} 
                                  style={styles.card}
                                  onPress={() => {
                                      router.push(`/${atendimento.id}`);
                                  }}
                              >
                                  <Text style={styles.cardHeader}>
                                      {atendimento.nomeCrianca || 'Nome não fornecido'}
                                  </Text>
                                  <Text style={styles.cardDetail}>
                                      Motivo: {atendimento.motivo ? atendimento.motivo.substring(0, 100) + '...' : 'N/A'}
                                  </Text>
                                  <Text style={styles.cardDate}>
                                      Registro: {atendimento.dataRegistro}
                                  </Text>
                              </Pressable>
                          ))
                      )}
                  </ScrollView>
              )}
          </View>
      );
    }

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    fullContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5ff',
    },
      header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#4b0afdff',
    },
  
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#4b0afdff',
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    cardHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    cardDetail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    cardDate: {
        fontSize: 12,
        color: '#888',
        textAlign: 'right',
        fontStyle: 'italic',
    },
});