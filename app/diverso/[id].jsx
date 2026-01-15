// app/(app)/diverso/[id].jsx

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Button, ActivityIndicator,KeyboardAvoidingView, Platform, TouchableOpacity, } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // ajuste o caminho se necessário

export default function DetalhesAtendimentoDiversos() {  
  const { id } = useLocalSearchParams();
  console.log('====================================');
  console.log('TELA DETALHES DIVERSOS CARREGOU!');
  console.log('ID recebido:', id);
  console.log('====================================');
  const [diversos, setDiversos] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  

  // Estados temporários para edição (copie os valores iniciais quando entrar em edição)
  const [nomeEdit, setNomeEdit] = useState('');
  const [cpfEdit, setCpfEdit] = useState('');
  const [telefoneEdit, setTelefoneEdit] = useState('');
  const [motivoEdit, setMotivoEdit] = useState('');
  const [dataNascimentoEdit, setDataNascimentoEdit] = useState(null);
  const [dataNascimentoTextoEdit, setDataNascimentoTextoEdit] = useState('');
  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '';
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const entrarModoEdicao = () => {
    setIsEditing(true);
  };

  const cancelarEdicao = () => {
    setIsEditing(false);
  };

  const salvarEdicao = async () => {
    if (!nomeEdit || !motivoEdit) {
      Alert.alert('Atenção', 'Nome e Motivo são obrigatórios.');
      return;
    }

    let dataNascimentoTimestamp = null;
    if (dataNascimentoEdit instanceof Date && !isNaN(dataNascimentoEdit.getTime())) {
      dataNascimentoTimestamp = Timestamp.fromDate(dataNascimentoEdit);
    }

    try {
      const docRef = doc(db, 'atendimentos-diversos', id);
      await updateDoc(docRef, {
        nome: nomeEdit,
        cpf: cpfEdit,
        telefone: telefoneEdit,
        motivo: motivoEdit,
        dataNascimento: dataNascimentoTimestamp,
        dataAtualizacao: Timestamp.now(),
      });

      Alert.alert('Sucesso', 'Atendimento atualizada!');
      setIsEditing(false);
      fetchDiversos(); // recarrega os dados
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const excluirDiversos = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este atendimento? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(db, 'atendimentos-diversos', id);
              await deleteDoc(docRef);
              Alert.alert('Sucesso', 'Atendimento excluído!');
              router.back(); // volta para a lista
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o atendimento.');
            }
          },
        },
      ]
    );
  };

  if (!id) {
      Alert.alert('Erro', 'ID não encontrado.');
      setLoading(false);
      return;
    }

    const fetchDiversos = async () => {
      console.log('Buscando na coleção: atendimentos-diversos / ID:', id);

      try {
        const docRef = doc(db, 'atendimentos-diversos', id);
        const docSnap = await getDoc(docRef);

        console.log('Documento existe?', docSnap.exists());
        console.log('exists() retornou:', docSnap.exists());
        console.log('ID usado na busca:', docRef.id);  // deve ser igual ao log anterior
        if (!docSnap.exists()) {
        console.log('Documento não encontrado. Possíveis motivos: ID inválido, coleção errada ou doc deletado.');
        }

        if (docSnap.exists()) {
  const data = docSnap.data();
  console.log('Dados do Firestore:', data);

  setDiversos({
    id: docSnap.id,
    ...data,
    dataRegistro: data.dataRegistro?.toDate()?.toLocaleString('pt-BR') || 'N/A',
    dataNascimento: data.dataNascimento?.toDate()?.toLocaleDateString('pt-BR') || 'N/A',
  });

  // Preenche os campos de edição
  setNomeEdit(data.nome || '');
  setCpfEdit(data.cpf || '');
  setTelefoneEdit(data.telefone || '');
  setMotivoEdit(data.motivo || '');

  if (data.dataNascimento?.toDate) {
    const date = data.dataNascimento.toDate();
    setDataNascimentoEdit(date);
    setDataNascimentoTextoEdit(date.toLocaleDateString('pt-BR'));
  } else {
    setDataNascimentoEdit(null);
    setDataNascimentoTextoEdit('');
  }
}

                      
         else {
          console.log('Doc NÃO encontrado');
          Alert.alert('Erro', 'Atendimento não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDiversos();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b0afdff" />
        <Text>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!diversos) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Atendimento não encontrado.</Text>
      </View>
    );
  }


  return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 40}
  >
    {loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b0afdff" />
        <Text>Carregando detalhes...</Text>
      </View>
    ) : !diversos ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Atendimento não encontrado.</Text>
      </View>
    ) : (
      <ScrollView
       style={styles.container}
  contentContainerStyle={{ paddingBottom: 120 }}  // ← aqui, como prop do ScrollView
  keyboardShouldPersistTaps="handled"
>
        <Text style={styles.title}>
          {isEditing ? 'Editar Atendimento Diverso' : 'Detalhes do Atendimento Diverso'}
        </Text>

        {/* Campos - modo visualização ou edição */}
        <View style={styles.section}>
          <Text style={styles.label}>Nome:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={nomeEdit}
              onChangeText={setNomeEdit}
              placeholder="Nome completo"
            />
          ) : (
            <Text style={styles.value}>{diversos.nome || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>CPF:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={cpfEdit}
              onChangeText={setCpfEdit}
              keyboardType="numeric"
              maxLength={11}
            />
          ) : (
            <Text style={styles.value}>{diversos.cpf || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data de Nascimento:</Text>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={dataNascimentoTextoEdit}
                onChangeText={(text) => {
                  // Reutilize ou crie handleDateChangeEdit se quiser máscara
                  let clean = text.replace(/\D/g, '').slice(0, 8);
                  let formatted = clean;
                  if (clean.length > 2) formatted = clean.slice(0,2) + '/' + clean.slice(2);
                  if (clean.length > 4) formatted = clean.slice(0,2) + '/' + clean.slice(2,4) + '/' + clean.slice(4);
                  setDataNascimentoTextoEdit(formatted);

                  if (clean.length === 8) {
                    const d = parseInt(clean.slice(0,2), 10);
                    const m = parseInt(clean.slice(2,4), 10);
                    const y = parseInt(clean.slice(4,8), 10);
                    const date = new Date(y, m-1, d);
                    if (!isNaN(date.getTime()) && date <= new Date()) {
                      setDataNascimentoEdit(date);
                    }
                  }
                }}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
              
            </>
          ) : (
            <Text style={styles.value}>{diversos.dataNascimento || 'Não informado'}</Text>
          )}
        </View>

        {/* Repita para telefone e motivo com TextInput quando isEditing */}

        <View style={styles.section}>
          <Text style={styles.label}>Telefone:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={telefoneEdit}
              onChangeText={setTelefoneEdit}
              keyboardType="phone-pad"
              placeholder="(99) 99999-9999"
            />
          ) : (
            <Text style={styles.value}>{diversos.telefone || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Motivo do Atendimento:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={motivoEdit}
              onChangeText={setMotivoEdit}
              multiline
              placeholder="Descreva o motivo"
            />
          ) : (
            <Text style={styles.value}>{diversos.motivo || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Registrado em:</Text>
          <Text style={styles.value}>{diversos.dataRegistro}</Text>
        </View>

        {/* Botões na parte de baixo */}
        <View style={{ padding: 20, gap: 12 }}>
  {isEditing ? (
    <>
      {/* Botão Salvar Alterações - VERDE */}
      <TouchableOpacity
        onPress={salvarEdicao}
        style={{
          backgroundColor: '#28a745',  // verde exato da outra tela
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,  // sombra leve
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Salvar Alterações
        </Text>
      </TouchableOpacity>

      {/* Botão Cancelar Edição - CINZA */}
      <TouchableOpacity
        onPress={cancelarEdicao}
        style={{
          backgroundColor: '#6c757d',  // cinza exato
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Cancelar Edição
        </Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      {/* Botão Editar */}
      <TouchableOpacity
        onPress={entrarModoEdicao}
        style={{
          backgroundColor: '#007bff',  // azul para editar (ou mude se quiser)
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Editar Registro
        </Text>
      </TouchableOpacity>

      {/* Botão Excluir */}
      <TouchableOpacity
        onPress={excluirDiversos}
        style={{
          backgroundColor: '#dc3545',  // vermelho para excluir
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Excluir Registro
        </Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </>
  )}
</View>
      </ScrollView>
    )}
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#4b0afdff', textAlign: 'center' },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  value: { fontSize: 16, color: '#555' },
  section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        elevation: 1,
  },
  label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        color: '#444',
  },
  input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
  inputArea: { // para motivo, se for multiline
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
});