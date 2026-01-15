// app/(app)/lista-denuncias.jsx 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { db } from '../../firebase'; // ajuste o caminho
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext'; // ajuste se necessário

export default function ListaDenuncias() {
  const { user } = useAuth();
  const [denuncia, setDenuncia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState ('');

  

  useEffect(() => {
    if (!user) {
      Alert.alert('Erro', 'Faça login para ver as Denúncias.');
      setLoading(false);
      return;
    }

    console.log('Buscando denuncias para user:', user.uid);

    const q = query(collection(db, 'denuncia'), orderBy('dataRegistro', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('onSnapshot sucesso! Docs recebidos:', snapshot.size);
      if (snapshot.empty) {
        console.log('Nenhum doc na coleção denuncia');
      }

      const lista = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Doc ID:', doc.id, 'Nome:', data.nome || 'sem nome');
        return {
          id: doc.id,
          ...data,
          dataRegistro: data.dataRegistro?.toDate()?.toLocaleString('pt-BR') || 'N/A',
        };
      });

      setDenuncia(lista);
      setLoading(false);
    }, (error) => {
      console.error('Erro onSnapshot:', error);
      Alert.alert('Erro', 'Falha ao carregar: ' + error.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredDenuncia = denuncia.filter((denuncia) => {
  const search = searchText.toLowerCase().trim();
  if (!search) return true;

  const fields = [
    denuncia.comunicante,
    denuncia.agenteviolador,
    denuncia.motivo,
    denuncia.dataRegistro?.toDate?.()?.toLocaleDateString('pt-BR'),
  ];

  return fields.some(field => 
    field && typeof field === 'string' && field.toLowerCase().includes(search)
  );
});

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b0afdff" />
        <Text>Carregando Denúncias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Denúncias</Text>

      <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="🔍 comunicante, agente violador ou motivo..."
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
        
                    {denuncia.length === 0 && !searchText ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhuma denúncia registrada ainda.</Text>
                            <Text>Clique no botão acima para começar!</Text>
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.listContainer}>
                            {filteredDenuncia.length === 0 && searchText ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>Nenhum resultado encontrado para "{searchText}".</Text>
                                </View>
                            ) : (
                                filteredDenuncia.map((denuncia) => (
                                    <Pressable 
                                        key={denuncia.id} 
                                        style={styles.card}
                                        onPress={() => {
                                            router.push(`/denuncia/${denuncia.id}`);
                                        }}
                                    >
                                        <Text style={styles.cardHeader}>
                                            {denuncia.comunicante || 'Nome não fornecido'}
                                        </Text>
                                        <Text style={styles.cardDetail}>
                                            Motivo: {denuncia.motivo ? denuncia.motivo.substring(0, 100) + '...' : 'N/A'}
                                        </Text>
                                        <Text style={styles.cardDate}>
                                            Registro: {denuncia.dataRegistro}
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
    
  container: { flex: 1, backgroundColor: '#f5f5f5ff' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 20, color: '#4b0afdff', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center' },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeader: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardDetail: { fontSize: 14, color: '#555', marginTop: 4 },
  cardDate: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' },
});