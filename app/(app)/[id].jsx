// AppConselhoTutelarRN/app/[id].jsx - Tela de Detalhes/Edição

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Button, ActivityIndicator,KeyboardAvoidingView, Platform, TouchableOpacity, } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Caminho para o Firebase
//import { Stack } from 'expo-router';//

const applyPhoneMask = (value) => {
  let digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) {
    return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  }
  // 8 ou 9 dígitos após DDD
  const ddd = digits.slice(0, 2);
  let numero = digits.slice(2);

  if (numero.length === 8) {
    // Fixo: 9999-9999
    return `(${ddd}) ${numero.slice(0,4)}-${numero.slice(4)}`;
  }
  // Celular (9 dígitos) ou mais (corta)
  if (numero.length >= 9) {
    numero = numero.slice(0, 9);
    return `(${ddd}) ${numero.slice(0,5)}-${numero.slice(5)}`;
  }

  return `(${ddd}) ${numero}`;
};
export default function DetalhesAtendimentoScreen() {
    const { id } = useLocalSearchParams(); // Pega o ID da URL
    const [atendimento, setAtendimento] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [historico, setHistorico] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showSexoOptions, setShowSexoOptions] = useState(false);

    // Estados para edição
    const [nomeCrianca, setNomeCrianca ] = useState('');
    const [filiacao1, setFiliacao1] = useState('');
    const [filiacao2, setFiliacao2] = useState('');
    const [cpf, setCpf] = useState('');
    const [sexo, setSexo] = useState('');
    const [endereco, setEndereco] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [motivo, setMotivo] = useState('');
    const [encaminhamentos, setEncaminhamentos] = useState('');
    const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
    const [cidade, setCidade] = useState('');
    const [naturalidade, setNaturalidade] = useState('');
    const [uf, setUf] = useState('');
    const getSexoLabel = (value) => {
    if (value === 'M') return 'Masculino';
    if (value === 'F') return 'Feminino';
    if (value === 'O') return 'Outro';
    return 'Não informado';
    };

    const safeGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Se não puder voltar (ex: veio de um link direto), volta para a Home.
            router.replace('/');
            }
        }

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

        // Atualiza o estado que é usado no TextInput
        setDataNascimento(formattedText);
        // NOTA: A lógica de salvar no Firestore irá pegar esta string formatada.
    };

    const handleAddAcompanhamento = () => {
    // 🚨 VERIFICAÇÃO ADICIONADA 🚨
    if (!atendimento || !atendimento.id || !atendimento.nomeCrianca) {
        Alert.alert("Aguarde", "Carregando detalhes do atendimento. Tente em instantes.");
        return;
    }
    
    // Agora é seguro acessar atendimento.id e atendimento.nomeCrianca
    router.push({
        pathname: "/novo-acompanhamento",
        // Certifique-se de que o ID e o nome estão sendo repassados corretamente
        params: { id: atendimento.id, nome: atendimento.nomeCrianca } 
    });
    };

    // Efeito para carregar os dados
    useEffect(() => {
        if (!id) return; // Garante que temos um ID
        
        const docRef = doc(db, 'atendimentos', id);
        
        // Função para buscar os dados
        const fetchAtendimento = async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAtendimento({
                        id:docSnap.id,
                        ...data,
                    });
                    
                    // Preenche os campos de edição com os dados atuais
                    setNomeCrianca(data.nomeCrianca || '');
                    setFiliacao1(data.filiacao1 || '');
                    setFiliacao2(data.filiacao2 || '');
                    setMotivo(data.motivo || '');
                    setSexo(data.sexo || '');
                    setEncaminhamentos(data.encaminhamentos || '');
                    setTelefoneResponsavel(data.telefoneResponsavel || '');
                    setCpf(data.cpf || '');
                    setEndereco(data.endereco || '');
                    setCidade(data.cidade || '');
                    setNaturalidade(data.naturalidade || '');
                    setUf(data.uf || '');
                    if (data.dataNascimento && data.dataNascimento.toDate) {
                        // Se for um Timestamp válido, converte para Date e depois para string DD/MM/AAAA
                        setDataNascimento(data.dataNascimento.toDate().toLocaleDateString('pt-BR'));
                    } else {
                        // Caso contrário, define como string vazia (ou o valor que vier)
                        setDataNascimento('');
                    }
                    
                } else {
                    Alert.alert("Erro", "Atendimento não encontrado.");
                    const safeGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Se não puder voltar (ex: veio de um link direto), volta para a Home.
            router.replace('/'); 
        }
    };
                }
            } catch (e) {
                console.error("Erro ao buscar atendimento: ", e);
                Alert.alert("Erro", "Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        };

        fetchAtendimento();
    }, [id, refreshKey]);
    
    useEffect(() => {
        if (!id) return;

        // 1. Cria a referência para a subcoleção
        const historicoRef = collection(db, 'atendimentos', id, 'historico_acompanhamento');

        // 2. Cria a consulta, ordenando pelo mais recente
        const q = query(historicoRef, orderBy('dataAcompanhamento', 'desc'));

        // 3. Configura o listener em tempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setHistorico(items);
        }, (error) => {
            console.error("Erro ao carregar histórico: ", error);
        });

        // 4. Função de limpeza (para o listener quando a tela for fechada)
        return () => unsubscribe();
    }, [id,setHistorico]);

    // Atualiza o título da tela
    /*
    useLayoutEffect(() => {
        router.setOptions({
            title: isEditing ? 'Editando Registro' : (atendimento?.nomeCrianca || 'Detalhes'),
        });
    }, [isEditing, atendimento, router]);
    */

    // ------------------------------------
    // FUNÇÕES DE AÇÃO
    // ------------------------------------

    const handleSave = async () => {
        if (!nomeCrianca || !motivo || !sexo) {
        Alert.alert("Atenção", "Nome, Motivo e Sexo são campos obrigatórios.");
        return;
        }
        let dataNascimentoTimestamp = null;
    if (dataNascimento && dataNascimento.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Converte DD/MM/AAAA para YYYY-MM-DD para criar um Date
        const [dia, mes, ano] = dataNascimento.split('/');
        const dataObjeto = new Date(`${ano}-${mes}-${dia}T00:00:00`); // Horário 00:00:00 para evitar problemas de fuso
        
        // Verifica se o Date é válido (evita datas malucas)
        if (!isNaN(dataObjeto.getTime())) {
            dataNascimentoTimestamp = Timestamp.fromDate(dataObjeto);
        }
    }

        setLoading(true);
        try {
            const docRef = doc(db, 'atendimentos', id);
            await updateDoc(docRef, {
                nomeCrianca,
                cpf,
                sexo,
                filiacao1,
                filiacao2,
                telefoneResponsavel: telefoneResponsavel,
                endereco,
                dataNascimento: dataNascimentoTimestamp,
                motivo,
                encaminhamentos,
                cidade,           
                naturalidade,     
                uf,
                dataAtualizacao: new Date(), // Adiciona um timestamp de atualização
            });
            
            Alert.alert("Sucesso", "Atendimento atualizado com sucesso!");
            
            // Recarrega a tela para mostrar os novos dados e sai do modo edição
            //setAtendimento({ ...atendimento, nomeCrianca, motivo, encaminhamentos });
            setIsEditing(false);
            setRefreshKey(prevKey => prevKey + 1);

        } catch (e) {
            console.error("Erro ao atualizar: ", e);
            Alert.alert("Erro", "Não foi possível salvar as alterações.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = () => {
    // Verifica se atendimento está carregado. Se não, usa um fallback
    const nome = atendimento?.nomeCrianca || "este registro";
    
    // Se o objeto atendimento for null ou undefined, impedimos ações críticas
    if (!atendimento || !atendimento.id) {
         Alert.alert("Erro", "Detalhes do atendimento não carregados. Tente novamente.");
         return;
    }
    
    Alert.alert(
        "Confirmar Exclusão",
        // Agora usamos a constante 'nome' que está garantida como string
        `Tem certeza que deseja excluir o atendimento de ${nome}?`,
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir", style: "destructive", onPress: confirmDelete }
        ]
    );
    };

    const confirmDelete = async () => {
        setLoading(true);

        try {
            const docRef = doc(db, 'atendimentos', id);
            await deleteDoc(docRef);
            
            Alert.alert("Sucesso", "Atendimento excluído com sucesso!");
            router.replace('/'); // Volta para a tela principal (Home)

        } catch (e) {
            console.error("Erro ao excluir: ", e);
            Alert.alert("Erro", "Não foi possível excluir o atendimento.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // RENDERIZAÇÃO
    // ------------------------------------

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b0afdff" />
                <Text>Carregando...</Text>
            </View>
        );
    }
    
    // Se estiver editando, mostra o formulário
    if (isEditing) {
    return (
        
        // 🚨 NOVO: KeyboardAvoidingView para Edição 🚨
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.flexOne} // Usaremos um novo estilo {flex: 1}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}          
            >              
            <ScrollView
             contentContainerStyle={styles.scrollContent} 
            >
                <Text style={styles.header}>Editar Atendimento</Text>
                <Text style={styles.label}>Nome da Criança</Text>
                <TextInput 
                    style={styles.input} 
                    value={nomeCrianca} 
                    onChangeText={setNomeCrianca} 
                />
                <Text style={styles.label}>CPF</Text>
                <TextInput 
                 style={styles.input} 
                 value={cpf} 
                 onChangeText={setCpf}
                 keyboardType="numeric"
                 maxLength={11}
                />
                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput 
                style={styles.input} 
                value={dataNascimento} 
                onChangeText={handleDateChange} // Manter como texto simples na edição para simplificar
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
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
                <Text style={styles.label}>Naturalidade</Text>
                <TextInput 
                    style={styles.input} 
                    value={naturalidade} 
                    onChangeText={setNaturalidade}
                    placeholder="Cidade de nascimento"
                />
                <Text style={styles.label}>Filiação 1</Text>
                <TextInput 
                    style={styles.input} 
                    value={filiacao1} 
                    onChangeText={setFiliacao1} 
                />

                <Text style={styles.label}>Filiação 2</Text>
                <TextInput 
                    style={styles.input} 
                    value={filiacao2} 
                    onChangeText={setFiliacao2} 
                />
                <Text style={styles.label}>Telefone do Responsável</Text>
                <TextInput
                style={styles.input}
                placeholder="(99) 99999-9999"
                keyboardType="phone-pad" // 🚨 Teclado otimizado para telefone
                value={telefoneResponsavel}
                onChangeText={(text) => setTelefoneResponsavel(applyPhoneMask(text))}
                maxLength={15} // Adiciona limite para a string formatada
                />
                
                <Text style={styles.label}>Endereço</Text>
                <TextInput 
                style={styles.input} 
                value={endereco} 
                onChangeText={setEndereco}
                multiline
                />
                <Text style={styles.label}>Cidade de Residência</Text>
                <TextInput 
                    style={styles.input} 
                    value={cidade} 
                    onChangeText={setCidade}
                    placeholder="Cidade onde reside"
                />
                <Text style={styles.label}>UF (Estado)</Text>
                <TextInput 
                    style={styles.input} 
                    value={uf} 
                    onChangeText={(text) => setUf(text.toUpperCase())}
                    placeholder="Ex: MT"
                    maxLength={2}
                    autoCapitalize="characters"
                />
                
                <Text style={styles.label}>Motivo</Text>
                <TextInput 
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    value={motivo} 
                    onChangeText={setMotivo}
                    multiline
                />
                <Text style={styles.label}>Encaminhamentos</Text>
                <TextInput 
                    style={styles.input} 
                    value={encaminhamentos} 
                    onChangeText={setEncaminhamentos}
                    multiline
                />

                <View style={styles.buttonSpacing}>
                    <Button title="Salvar Alterações" onPress={handleSave} color="#28a745" />
                </View>
                <Button title="Cancelar Edição" onPress={() => setIsEditing(false)} color="#6c757d" />
                 <View style={{ height: 40 }} />   
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
    if (!atendimento.id && !loading) {
    return (
        <View style={styles.loadingContainer}>
            <Text>Atendimento não encontrado ou houve um erro.</Text>
        </View>
    );
    }
    
    return (
    // 🚨 NOVO: KeyboardAvoidingView para Visualização (para proteger o bloco de botões) 🚨
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.flexOne}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
    >
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Detalhes do Atendimento</Text>
            <Text style={styles.title}>{atendimento?.nomeCrianca}</Text>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>CPF:</Text>
                <Text style={styles.sectionContent}>{atendimento?.cpf || 'Não informado'}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data de Nascimento:</Text>
                {/* Exibe o estado dataNascimento que foi formatado no useEffect */}
                <Text style={styles.sectionContent}>
                {atendimento?.dataNascimento?.toDate?.()
                ? atendimento.dataNascimento.toDate().toLocaleDateString('pt-BR')
                : 'Não informado'}
                </Text> 
            </View>
            <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sexo:</Text>
        <Text style={styles.sectionContent}>
          {getSexoLabel(atendimento.sexo)}
        </Text>
      </View>
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Naturalidade:</Text>
            <Text style={styles.sectionContent}>{atendimento?.naturalidade || 'Não informada'}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filiação 1:</Text>
                <Text style={styles.sectionContent}>{atendimento?.filiacao1 || 'não informado'} </Text>
                </View>
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filiação 2:</Text>
                <Text style={styles.sectionContent}>{atendimento?.filiacao2 || 'não informado'} </Text>
                </View>
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Telefone do Responsável:</Text>
                <Text style={styles.sectionContent}>
                {atendimento?.telefoneResponsavel || 'Não informado'}
                </Text>
                </View>
            
            

            {/* 🚨 NOVO BLOCO: ENDEREÇO */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Endereço:</Text>
                <Text style={styles.sectionContent}>{atendimento?.endereco || 'Não informado'}</Text>
            </View>
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cidade de Residência:</Text>
            <Text style={styles.sectionContent}>{atendimento?.cidade || 'Não informado'}</Text>
            </View>
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>UF (Estado):</Text>
            <Text style={styles.sectionContent}>{atendimento?.uf || 'Não informado'}</Text>
            </View>         
                        
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Motivo do Atendimento:</Text>
                <Text style={styles.sectionContent}>{atendimento?.motivo}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Encaminhamentos:</Text>
                <Text style={styles.sectionContent}>{atendimento?.encaminhamentos}</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.sectionDate}>
                    Registrado em: {atendimento?.dataRegistro?.toDate().toLocaleString('pt-BR') || 'N/A'}
                </Text>
                {atendimento?.dataAtualizacao && (
                    <Text style={styles.sectionDate}>
                        Última atualização: {atendimento?.dataAtualizacao.toDate().toLocaleString('pt-BR')}
                    </Text>
                )}
            </View>
            
            {/* BLOCO HISTÓRICO DE ACOMPANHAMENTO */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Histórico de Acompanhamento:</Text>
                
                {historico.length === 0 ? (
                    <Text style={styles.sectionContent}>Nenhum acompanhamento registrado ainda.</Text>
                ) : (
                    historico.map((item, index) => (
                        <View key={item.id} style={styles.historicoItem}>
                            <Text style={styles.historicoDate}>
                                {item.dataAcompanhamento?.toDate().toLocaleString('pt-BR') || 'Data Indisponível'}
                            </Text>
                            
                            <Text style={styles.historicoLabel}>Motivo do Retorno:</Text>
                            <Text style={styles.historicoContent}>{item.motivoRetorno}</Text>
                            
                            <Text style={styles.historicoLabel}>Ações Tomadas:</Text>
                            <Text style={styles.historicoContent}>{item.acoesTomadas}</Text>
                            
                            {/* Adiciona um separador se não for o último item */}
                            {index < historico.length - 1 && <View style={styles.historicoSeparator} />}
                        </View>
                    ))
                )}
            </View>
            {/* FIM BLOCO HISTÓRICO */}

            {/* Botões de Ação (Empilhados Verticalmente) */}
            <View style={styles.actionButtons}>
    {/* 🚨 CORREÇÃO FINAL: Todos os botões dependentes de atendimento são agrupados aqui 🚨 */}
    {atendimento && (
        <>
            <View style={styles.buttonSpacing}> 
                <Button 
                    title="➕ Novo Acompanhamento"
                    onPress={handleAddAcompanhamento} 
                    color="#20c997" 
                />
            </View>
            <View style={styles.buttonSpacing}> 
                <Button title="Editar Registro" onPress={() => setIsEditing(true)} color="#007bff" />
            </View>
            <View style={styles.buttonSpacing}> 
                {/* O handleDelete já tem proteção interna, mas a renderização é mais limpa aqui */}
                <Button title="Excluir Registro" onPress={handleDelete} color="#dc3545" />
            </View>
        </>
    )}
</View>
<View style={{ height: 100 }} />
</ScrollView>
</KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#4b0afdff',
    },

    scrollContent: {
        paddingBottom: 120,
        // Aumenta o padding inferior do ScrollView
        paddingHorizontal:20,
    },
    flexOne: { 
        flex: 1,
    },
    container: {
        flex: 1,
        padding:20,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#555',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
    },
    sectionContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    sectionDate: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
        color: '#444',
    },
    actionButtons: {
        marginTop: 20,
        flexDirection: 'column',
        justifyContent: 'space-around',
        gap: 10,
        marginBottom: 20,
    },
        buttonSpacing:{
            marginBottom:10,
    },
    buttonSpacing: {
        marginBottom: 10,
    },
    sexoContainer: { marginBottom: 20 },
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
sexoText: { fontSize: 16, color: '#333' },
sexoArrow: { fontSize: 18, color: '#666' },
sexoOptionsContainer: {
  marginTop: 4,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  backgroundColor: '#fff',
  overflow: 'hidden',
},
sexoOption: {
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
sexoOptionText: { fontSize: 16, color: '#333' },
});