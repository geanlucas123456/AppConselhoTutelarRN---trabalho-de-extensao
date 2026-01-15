import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';

// Funções auxiliares (copie do adicionar.jsx se já tiver)
const applyPhoneMask = (value) => {
    // 1. Remove tudo que não for dígito
    let cleanValue = value.replace(/\D/g, '');

    // 2. Limita o tamanho máximo a 11 dígitos (99999999999)
    if (cleanValue.length > 11) {
        cleanValue = cleanValue.substring(0, 11);
    }

    // 3. Aplica a máscara: (99) 99999-9999
    let maskedValue = '';
    
    // (99)
    if (cleanValue.length > 0) {
        maskedValue += '(' + cleanValue.substring(0, 2);
    }
    
    // ) 9999
    if (cleanValue.length > 2) {
        maskedValue += ') ' + cleanValue.substring(2, 7);
    } else if (cleanValue.length > 1) {
        maskedValue += ') ' + cleanValue.substring(2);
    }

    // - 9999
    if (cleanValue.length > 7) {
        maskedValue += '-' + cleanValue.substring(7, 11);
    }
    
    // Se for telefone fixo (8 dígitos depois do DDD), ajusta a máscara: (99) 9999-9999
    if (cleanValue.length === 10) {
        // Remove a máscara e refaz para 8 dígitos
        maskedValue = '(' + cleanValue.substring(0, 2) + ') ' + cleanValue.substring(2, 6) + '-' + cleanValue.substring(6, 10);
    }
    // Prioriza o formato de 9 dígitos para celular
    if (cleanValue.length === 11) {
        maskedValue = '(' + cleanValue.substring(0, 2) + ') ' + cleanValue.substring(2, 7) + '-' + cleanValue.substring(7, 11);
    }
    
    return maskedValue;
};

export default function AdicionarDiversoScreen() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimentoTexto, setDataNascimentoTexto] = useState('');
  const [dataNascimento, setDataNascimento] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleDateChange = (text) => {
    // Remove tudo que não for número
    let cleanText = text.replace(/\D/g, '');

    // Limita a 8 dígitos (DDMMYYYY)
    if (cleanText.length > 8) {
      cleanText = cleanText.substring(0, 8);
      const hoje = new Date();
hoje.setHours(0, 0, 0, 0); // ignora hora para comparar só data

if (dateObj > hoje) {
  // Data futura → inválida
  console.log('Data futura detectada:', dateObj);
  // Pode mostrar alerta aqui, mas para não interromper digitação, só não seta
} else if (dateObj.getFullYear() < 1900) {
  // Muito antiga → opcional
} else {
  setDataNascimento(dateObj);
  return;
}
    }

    let formattedText = cleanText;

    // Aplica máscara DD/MM/AAAA
    if (cleanText.length > 2) {
      formattedText = cleanText.substring(0, 2) + '/' + cleanText.substring(2);
    }
    if (cleanText.length > 4) {
      formattedText = cleanText.substring(0, 2) + '/' + cleanText.substring(2, 4) + '/' + cleanText.substring(4);
    }

    setDataNascimentoTexto(formattedText);

    // Se vazio → limpa o objeto Date
    if (!cleanText) {
      setDataNascimento(null);
      return;
    }

    // Só tenta criar Date se tiver exatamente 8 dígitos
    if (cleanText.length === 8) {
  const day   = parseInt(cleanText.substring(0, 2), 10);
  const month = parseInt(cleanText.substring(2, 4), 10);
  const year  = parseInt(cleanText.substring(4, 8), 10);

  const dateObj = new Date(year, month - 1, day);

  // Validações extras
  const hoje = new Date();
  const idadeMaximaAnos = 120; // opcional: ninguém vive mais de 120 anos
  const dataMinima = new Date(hoje.getFullYear() - idadeMaximaAnos, hoje.getMonth(), hoje.getDate());

  if (
    !isNaN(dateObj.getTime()) && // data válida
    dateObj <= hoje &&           // não pode ser futura
    dateObj >= dataMinima        // não pode ser muito antiga (opcional)
  ) {
    setDataNascimento(dateObj);
    return;
  }
}

    // Se inválido → mantém null
    setDataNascimento(null);
  };

  const handleSubmit = async () => {
    
    if (!nome || !motivo) {
      Alert.alert("Erro", "Nome e Motivo são obrigatórios.");
      return;
    }

    setLoading(true);

    const novoAtendimentoDiverso = {
      nome,
      cpf,
      dataNascimento: dataNascimento ? Timestamp.fromDate(dataNascimento) : null,
      telefone,
      motivo,
      dataRegistro: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(collection(db, "atendimentos-diversos"), novoAtendimentoDiverso);
      Alert.alert("Sucesso!", `Atendimento salvo com ID: ${docRef.id}`);
      
      // Limpar formulário
      setNome('');
      setCpf('');
      setDataNascimentoTexto('');
      setDataNascimento(null);
      setTelefone('');
      setMotivo('');
      
      setLoading(false);
      router.replace('/');  // Volta para home

    } catch (e) {
      console.error("Erro ao adicionar: ", e);
      Alert.alert("Erro", "Não foi possível salvar.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color="#4b0afdff" />
        <Text>Salvando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Novo Atendimento Diverso</Text>
        
        <Text style={styles.label}>Nome *</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />
        
        <Text style={styles.label}>CPF</Text>
        <TextInput style={styles.input} value={cpf} onChangeText={setCpf} placeholder="CPF (apenas números)" keyboardType="numeric" maxLength={11} />
        
        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput 
          style={styles.input} 
          value={dataNascimentoTexto} 
          onChangeText={handleDateChange}
          placeholder="DD/MM/AAAA" 
          keyboardType="numeric" 
          maxLength={10}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {dataNascimento ? (
  <Text style={{ color: 'green', marginTop: 5 }}>
    Data válida: {dataNascimento.toLocaleDateString('pt-BR')} ({calcularIdade(dataNascimento)} anos)
  </Text>
) : dataNascimentoTexto.length === 10 ? (
  <Text style={{ color: 'red', marginTop: 5 }}>
    Data inválida, futura ou incompleta
  </Text>
) : null}
        
        <Text style={styles.label}>Telefone</Text>
        <TextInput 
          style={styles.input} 
          value={telefone} 
          onChangeText={(text) => setTelefone(applyPhoneMask(text))} 
          placeholder="(99) 99999-9999" 
          keyboardType="phone-pad" 
          maxLength={15} 
        />
        
        <Text style={styles.label}>Motivo do Atendimento *</Text>
        <TextInput 
          style={styles.inputArea} 
          value={motivo} 
          onChangeText={setMotivo} 
          placeholder="Descreva o motivo" 
          multiline 
        />
        
        <Button title="Salvar Atendimento Diverso" onPress={handleSubmit} color="#28a745" />
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos (copie/adapte do adicionar.jsx)
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    containerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#4b0afdff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    inputArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        height: 100,
        textAlignVertical: 'top', // Para que o texto comece no topo
        backgroundColor: '#fff',
    },
    sexoContainer: {
  marginBottom: 20,
},
sexoSelector: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 14,
  backgroundColor: '#fff',
},
sexoText: {
  fontSize: 16,
  color: '#333',
},
sexoArrow: {
  fontSize: 18,
  color: '#666',
},
sexoOptionsContainer: {
  marginTop: 4,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  backgroundColor: '#fff',
  overflow: 'hidden', // para cantos arredondados
},
sexoOption: {
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
sexoOptionText: {
  fontSize: 16,
  color: '#333',
},
// Opcional: destacar opção selecionada
sexoOptionSelected: {
  backgroundColor: '#f0f4ff',
},
});