// AppConselhoTutelarRN/app/adicionar.jsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity,

} from 'react-native';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { router } from 'expo-router'; // Para navegação

// 🚨 COLE A FUNÇÃO applyPhoneMask AQUI 🚨
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
const getSexoLabel = (value) => {
  if (value === 'M') return 'Masculino';
  if (value === 'F') return 'Feminino';
  if (value === 'O') return 'Outro';
  return 'Selecione o sexo';
};

export default function AdicionarAtendimentoScreen() {
    // 1. Estados dos campos do formulário (adaptado do seu projeto web)
    const [nomeCrianca, setNomeCrianca] = useState('');
    const [sexo, setSexo] = useState('');
    const [showSexoOptions, setShowSexoOptions] = useState(false);
    const [filiacao1, setFiliacao1] = useState('');
    const [filiacao2, setFiliacao2] = useState('');
    const [dataNascimento, setDataNascimento] = useState(null); // Guarda o objeto Date
    const [dataNascimentoTexto, setDataNascimentoTexto] = useState(''); // Guarda o texto formatado para mostrar ao usuário
    const [cpf, setCpf] = useState('');
    const [endereco, setEndereco] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [encaminhamentos, setEncaminhamentos] = useState('');
    const [loading, setLoading] = useState(false);
    const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
    const [naturalidade, setNaturalidade] = useState('');
    const [uf, setUf] = useState('');
    const [cidade, setCidade] = useState('');
    const handleDateChange = (text) => {

     // 1. Limpa o texto, removendo tudo que não for dígito
     let cleanText = text.replace(/\D/g, '');

     // 2. Limita o tamanho máximo a 8 dígitos (DDMMYYYY)
     if (cleanText.length > 8) {
         cleanText = cleanText.substring(0, 8);
     }

     let formattedText = cleanText;

     // 3. Aplica as máscaras (DD/MM/AAAA)
     if (cleanText.length > 2) {
     formattedText = `${cleanText.substring(0, 2)}/${cleanText.substring(2)}`;
     }
     if (cleanText.length > 4) {
     formattedText = `${cleanText.substring(0, 2)}/${cleanText.substring(2, 4)}/${cleanText.substring(4)}`;
     }

     // Atualiza o estado da string de texto formatada
     setDataNascimentoTexto(formattedText);

     // 1. Se o campo foi limpo pelo usuário (ou está vazio), define o objeto Date como null.
     if (!cleanText) {
    setDataNascimento(null);
     return;
     }

     // 2. TENTA converter para um objeto Date real SÓ SE TIVER 8 DÍGITOS
     if (cleanText.length === 8) {
         const day = parseInt(cleanText.substring(0, 2), 10);
         const month = parseInt(cleanText.substring(2, 4), 10);
        const year = parseInt(cleanText.substring(4, 8), 10);

         // Validação básica
         if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
     // Se a data for válida, a convertemos para o formato Date que o Firebase espera
         const dateObject = new Date(year, month - 1, day); 
         setDataNascimento(dateObject); 
     return;
     }
     }
    
     // 3. Se não chegou aos 8 dígitos ou a data não era válida, define o objeto como null.
     setDataNascimento(null); 
};

    const handleSubmit = async () => {
        if (!nomeCrianca || !motivo) {
    Alert.alert("Erro", "Nome e Motivo são campos obrigatórios.");
    return;
}

        setLoading(true);
        if (cpf) { // Só executa a validação se o CPF foi preenchido
            try {
                const atendimentosRef = collection(db, 'atendimentos');
                
                // Cria a consulta: buscar qualquer registro com este CPF
                const q = query(atendimentosRef, where("cpf", "==", cpf));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.docs.length > 0) {
                    // DUPLICIDADE ENCONTRADA! Bloqueia o salvamento.
                    Alert.alert(
                        "Registro Existente", 
                        "Este CPF já está registrado em nosso sistema. Por favor, utilize a tela de Consulta para localizar o registro e adicionar um novo acompanhamento, em vez de criar um novo caso.",
                        [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Ir para Consulta", onPress: () => router.replace('/') }
                        ]
                    );
                    setLoading(false); // Remove o loading
                    return; // Interrompe a função e não salva
                }
            } catch (error) {
                console.error("Erro na verificação de duplicidade:", error);
                Alert.alert("Erro de Sistema", "Não foi possível verificar a duplicidade. Tente novamente.");
                setLoading(false);
                return;
            }
        }
        // 🚨 FIM DA LÓGICA DE VALIDAÇÃO DE DUPLICIDADE

        const novoAtendimento = {
            nomeCrianca,
            cpf: cpf,
            naturalidade: naturalidade,
            sexo,
            filiacao1,
            filiacao2,
            telefoneResponsavel: telefoneResponsavel,
            endereco: endereco,
            cidade: cidade,
            uf: uf,
            motivo,
            encaminhamentos,
            dataRegistro: Timestamp.now(), // Usando o carimbo de data/hora do Firebase
        };
        if (dataNascimento) {
    novoAtendimento.dataNascimento = Timestamp.fromDate(dataNascimento);
        }

        try {
            // 2. Lógica de salvamento no Firestore (A mesma que você usava!)
            const docRef = await addDoc(collection(db, "atendimentos"), novoAtendimento);
            
            Alert.alert("Sucesso!", `Atendimento de ${nomeCrianca} salvo com ID: ${docRef.id}`);
            
            // 3. Limpar formulário e voltar para a tela inicial
            setNomeCrianca('');
            setMotivo('');
            setEncaminhamentos('');
            setLoading(false);
            router.replace('/');
            
        } catch (e) {
            console.error("Erro ao adicionar documento: ", e);
            Alert.alert("Erro de Firebase", "Não foi possível salvar o atendimento. Verifique sua conexão.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.containerLoading}>
                <ActivityIndicator size="large" color="#4b0afdff" />
                <Text>Salvando atendimento...</Text>
            </View>
        );
    }

    // Estrutura do formulário (com ScrollView para telas menores)
    return (
    // 🚨 NOVO: KeyboardAvoidingView para empurrar o conteúdo
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Comportamento ideal para iOS e Android
        style={{ flex: 1 }} // Garante que ele ocupe todo o espaço
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20} // Ajuste o offset se o cabeçalho estiver cortando
    >
        <ScrollView 
        
            contentContainerStyle={styles.container}
            
            // Adicione estas duas linhas para melhor gerenciamento do scroll no Android
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false} 
        >
            <Text style={styles.header}>Novo Atendimento</Text>
            
            <Text style={styles.label}>Criança/Adolescente (*)</Text>
            <TextInput
                style={styles.input}
                value={nomeCrianca}
                onChangeText={setNomeCrianca}
                placeholder="Nome completo ou iniciais"
            />
            <Text style={styles.label}>CPF</Text>
            <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={setCpf}
                placeholder="CPF (apenas números)"
                keyboardType="numeric"
                maxLength={11}
            />
            <Text style={styles.label}>Data de Nascimento (Opcional)</Text>
            {/* Por enquanto, usamos um TextInput simples; você pode integrar um DatePicker aqui mais tarde */}
            <TextInput
            style={styles.input}
            value={dataNascimentoTexto}
            onChangeText={handleDateChange} // Chama a nova função de máscara
            placeholder="DD/MM/AAAA"
            keyboardType="numeric" // Restringe a entrada a números
            maxLength={10} // Limita o máximo de caracteres visíveis (incluindo as duas barras)
            />
            <View style={styles.sexoContainer}>
  <Text style={styles.label}>Sexo da Criança/Adolescente *</Text>
  
  <TouchableOpacity
    style={styles.sexoSelector}
    onPress={() => setShowSexoOptions(!showSexoOptions)}
    activeOpacity={0.8}
  >
    <Text style={styles.sexoText}>
      {getSexoLabel(sexo)}
    </Text>
    <Text style={styles.sexoArrow}>
      {showSexoOptions ? '▲' : '▼'}
    </Text>
  </TouchableOpacity>

  {showSexoOptions && (
    <View style={styles.sexoOptionsContainer}>
      <TouchableOpacity
        style={styles.sexoOption}
        onPress={() => {
          setSexo('M');
          setShowSexoOptions(false);
        }}
      >
        <Text style={styles.sexoOptionText}>Masculino</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.sexoOption}
        onPress={() => {
          setSexo('F');
          setShowSexoOptions(false);
        }}
      >
        <Text style={styles.sexoOptionText}>Feminino</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.sexoOption}
        onPress={() => {
          setSexo('O');
          setShowSexoOptions(false);
        }}
      >
        <Text style={styles.sexoOptionText}>Outro</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
            <Text style={styles.label}>Naturalidade (Cidade de Nascimento)</Text>
            <TextInput
            style={styles.input}
            value={naturalidade}
            onChangeText={setNaturalidade}
            placeholder="Cidade onde a criança/adolescente nasceu"
            />
            <Text style={styles.label}>Filiação 1 (Mãe/Pai/Responsável)</Text>
    <TextInput
        style={styles.input}
        value={filiacao1}
        onChangeText={setFiliacao1}
        placeholder="Nome completo da Filiação 1"
    />

    <Text style={styles.label}>Filiação 2 (Pai/Mãe/Responsável)</Text>
    <TextInput
        style={styles.input}
        value={filiacao2}
        onChangeText={setFiliacao2}
        placeholder="Nome completo da Filiação 2 (opcional)"
    />
    <Text style={styles.label}>Telefone do Responsável</Text>
    <TextInput
        style={styles.input}
        placeholder="(99) 99999-9999"
        keyboardType="phone-pad" // Teclado numérico otimizado
        value={telefoneResponsavel}
        onChangeText={(text) => setTelefoneResponsavel(applyPhoneMask(text))}
        maxLength={15} // Adiciona limite para a string formatada
    />
            
            {/* INÍCIO DAS CORREÇÕES - Adicionar TextInput para CPF e Endereço */}
            
            
            <Text style={styles.label}>Endereço</Text>
            <TextInput
                style={styles.input}
                value={endereco}
                onChangeText={setEndereco}
                placeholder="Endereço completo"
                multiline
            />
            <Text style={styles.label}>Cidade de Residência</Text>
            <TextInput
            style={styles.input}
            value={cidade}
            onChangeText={setCidade}
            placeholder="Cidade onde a criança/adolescente reside"
            />
            <Text style={styles.label}>UF (Estado de Nascimento)</Text>
            <TextInput
            style={styles.input}
            value={uf}
            onChangeText={(text) => setUf(text.toUpperCase())} // Converte para maiúsculas
            placeholder="Ex: MT"
            maxLength={2}
            />
            
            {/* FIM DAS CORREÇÕES */}
            
            <Text style={styles.label}>Motivo do Atendimento (*)</Text>
            <TextInput
                style={styles.inputArea}
                value={motivo}
                onChangeText={setMotivo}
                placeholder="Descreva o motivo principal"
                multiline
            />
            
            <Text style={styles.label}>Encaminhamentos/Providências</Text>
            <TextInput
                style={styles.inputArea}
                value={encaminhamentos}
                onChangeText={setEncaminhamentos}
                placeholder="Ex: Encaminhado ao CREAS, notificado à Escola X"
                multiline
            />
            
            <Button title="Salvar Atendimento" onPress={handleSubmit} color="#28a745" />
            <View style={{ height: 100 }} />
        </ScrollView>
    </KeyboardAvoidingView>
);
}

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