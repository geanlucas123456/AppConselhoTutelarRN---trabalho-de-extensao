// app/(app)/denuncia/[id].jsx

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Button, ActivityIndicator,KeyboardAvoidingView, Platform, TouchableOpacity, } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // ajuste o caminho se necessário

export default function DetalhesdenunciaScreen() {  
  const { id } = useLocalSearchParams();
  console.log('====================================');
  console.log('TELA DETALHES DENUNCIAS CARREGOU!');
  console.log('ID recebido:', id);
  console.log('====================================');
  const [denuncia, setDenuncia] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  

  // Estados temporários para edição (copie os valores iniciais quando entrar em edição)
    const [comunicanteEdit, setComunicanteEdit] = useState('');
    const [canalcomunicadoEdit, setCanalComunicadoEdit] = useState('');
    const [agentevioladorEdit, setAgenteVioladorEdit] = useState('');
    const [dataNascimentoTextoEdit, setDataNascimentoTextoEdit] = useState('');
    const [dataNascimentoEdit, setDataNascimentoEdit] = useState(null);
    const [telefoneEdit, setTelefoneEdit] = useState('');
    const [enderecoEdit, setEnderecoEdit] = useState('');
    const [motivoEdit, setMotivoEdit] = useState('');
  

  const entrarModoEdicao = () => {
    setIsEditing(true);
  };

  const cancelarEdicao = () => {
    setIsEditing(false);
  };

  const salvarEdicao = async () => {
    if (!comunicanteEdit || !motivoEdit) {
      Alert.alert('Atenção', 'comunicante e Motivo são obrigatórios.');
      return;
    }

    let dataNascimentoTimestamp = null;
    if (dataNascimentoEdit instanceof Date && !isNaN(dataNascimentoEdit.getTime())) {
      dataNascimentoTimestamp = Timestamp.fromDate(dataNascimentoEdit);
    }

    try {
      const docRef = doc(db, 'denuncia', id);
      await updateDoc(docRef, {
        nome: comunicanteEdit,
        canalcomunicado: canalcomunicadoEdit,
        agenteviolador: agentevioladorEdit,
        telefone: telefoneEdit,
        endereco:enderecoEdit,
        motivo: motivoEdit,
        dataNascimento: dataNascimentoTimestamp,
        dataAtualizacao: Timestamp.now(),
      });

      Alert.alert('Sucesso', 'denúncia atualizado!');
      setIsEditing(false);
      fetchDenuncia(); // recarrega os dados
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const excluirDenuncia = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta denúncia? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(db, 'denuncia', id);
              await deleteDoc(docRef);
              Alert.alert('Sucesso', 'denúncia excluída!');
              router.back(); // volta para a lista
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir a denúncia.');
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

    const fetchDenuncia = async () => {
      console.log('Buscando na coleção: denuncia / ID:', id);

      try {
        const docRef = doc(db, 'denuncia', id);
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

  setDenuncia({
    id: docSnap.id,
    ...data,
    dataRegistro: data.dataRegistro?.toDate()?.toLocaleString('pt-BR') || 'N/A',
    dataNascimento: data.dataNascimento?.toDate()?.toLocaleDateString('pt-BR') || 'N/A',
  });

  // Preenche os campos de edição
  setComunicanteEdit(data.comunicante || '');
  setCanalComunicadoEdit(data.canalcomunicado || '');
  setAgenteVioladorEdit(data.agenteviolador || '');
  setTelefoneEdit(data.telefone || '');
  setEnderecoEdit(data.endereco || '');
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
          Alert.alert('Erro', 'denuncia não encontrada.');
        }
      } catch (error) {
        console.error('Erro ao carregar:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDenuncia();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b0afdff" />
        <Text>Carregando denúncias...</Text>
      </View>
    );
  }

  if (!denuncia) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Denúncia não encontrada.</Text>
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
        <Text>Carregando denúncias...</Text>
      </View>
    ) : !denuncia ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Denúncia não encontrada.</Text>
      </View>
    ) : (
      <ScrollView
       style={styles.container}
  contentContainerStyle={{ paddingBottom: 120 }}  // ← aqui, como prop do ScrollView
  keyboardShouldPersistTaps="handled"
>
        <Text style={styles.title}>
          {isEditing ? 'Editar denuncia' : 'Detalhes da denúncia'}
        </Text>

        {/* Campos - modo visualização ou edição */}
        <View style={styles.section}>
          <Text style={styles.label}>Comunicante:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={comunicanteEdit}
              onChangeText={setComunicanteEdit}
              placeholder=""
            />
          ) : (
            <Text style={styles.value}>{denuncia.comunicante || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Canal do comunicado:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={canalcomunicadoEdit}
              onChangeText={setCanalComunicadoEdit}
              placeholder=""
            />
          ) : (
            <Text style={styles.value}>{denuncia.canalcomunicado || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Agente violador:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={agentevioladorEdit}
              onChangeText={setAgenteVioladorEdit}
              placeholder=""
            />
          ) : (
            <Text style={styles.value}>{denuncia.agenteviolador || 'Não informado'}</Text>
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
            <Text style={styles.value}>{denuncia.dataNascimento || 'Não informado'}</Text>
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
            <Text style={styles.value}>{denuncia.telefone || 'Não informado'}</Text>
          )}
        </View>
        <View style={styles.section}>
        <Text style={styles.label}>Endereço:</Text>
        {isEditing ? (
                <TextInput 
                style={styles.input} 
                value={enderecoEdit} 
                onChangeText={setEnderecoEdit}
                multiline
                />
                ) : (
                <Text style={styles.value}>{denuncia.endereco || 'Não informado'}</Text>
                )}
                </View>

        <View style={styles.section}>
          <Text style={styles.label}>Relato do comunicante:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={motivoEdit}
              onChangeText={setMotivoEdit}
              multiline
              placeholder="Descreva o motivo"
            />
          ) : (
            <Text style={styles.value}>{denuncia.motivo || 'Não informado'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Registrado em:</Text>
          <Text style={styles.value}>{denuncia.dataRegistro}</Text>
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
        onPress={excluirDenuncia}
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