# App Conselho Tutelar

Aplicativo mobile desenvolvido para auxiliar o **Conselho Tutelar** no registro, acompanhamento e gerenciamento de atendimentos e denúncias de violação de direitos de crianças e adolescentes.

## Tecnologias Utilizadas

- **React Native** + **Expo** (SDK 54) – Desenvolvimento mobile cross-platform
- **Expo Router** – Roteamento baseado em arquivos
- **Firebase**:
  - **Firestore** – Banco de dados NoSQL em tempo real
  - **Authentication** – Login com email e senha
- **React Context API** – Gerenciamento de estado global (autenticação)
- **Outras bibliotecas**:
  - `@react-navigation/native` (navegação e foco de tela)

## Como Rodar o Projeto (detalhado – evite erros comuns)

**Pré-requisitos**:
- Node.js 18 ou superior
- npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (emulador Android) ou Xcode (iOS) – opcional

1. Clone o repositório:
   ```bash
   git clone https://github.com/geanlucas123456/AppConselhoTutelarRN---trabalho-de-extensao.git
   trocar para o diretorio: cd AppConselhoTutelarRN---trabalho-de-extensao
   ```

2. Instale as dependências (use esta flag para evitar conflitos de versões):
   ```bash
   npm install --legacy-peer-deps
   ```
   > Se der erro de cache ou dependências, tente antes:
   > ```bash
   > npm cache clean --force
   > rm -rf node_modules
   > npm install --legacy-peer-deps
   > ```

3. Rode o aplicativo:
   ```bash
   npx expo start --clear
   ```
   - Pressione:
     - `a` → Android (emulador ou dispositivo)
     - `i` → iOS (emulador ou dispositivo)
     - `w` → Web (navegador)
   - Ou escaneie o QR code com o app **Expo Go** no celular.

4. **Login de teste** (credenciais prontas para avaliação):
   - **Email**: teste@estacio.com.br
   - **Senha**: 123456  

### Possíveis erros e soluções rápidas

- **Erro "Could not resolve dependency" ou conflito React 18/19**  
  Use sempre `--legacy-peer-deps` no install.

- **Tela branca, loading infinito ou "permission denied" no Firebase**  
  - Limpe o cache: `npx expo start --clear`
  - Use exclusivamente a conta de teste fornecida (email: teste@estacio.com.br / senha: 123456).
  - Verifique se o Firebase tem Authentication e Firestore ativados
  - Certifique-se de estar logado antes de qualquer ação.
  - o app usa meu projeto Firebase real, e as regras já estão configuradas para permitir leitura/escrita apenas para usuários autenticados. 
  - Regras de Firestore devem permitir leitura/escrita para usuários logados

- **Problemas com node_modules**  
  Delete a pasta e reinstale: `rm -rf node_modules && npm install --legacy-peer-deps`

## Estrutura Principal de Pastas e Telas

```plaintext
app/
├── _layout.jsx                     → Layout raiz da aplicação (autenticação, splash screen, proteção de rotas)
├── index.jsx                       → Tela de transição inicial / loading (opcional, redireciona para login ou home)
├── (auth)/
│   └── login.jsx                   → Tela de login (email e senha)
└── (app)/                          → Grupo de telas protegidas (só acessíveis após login)
    ├── _layout.jsx                 → Layout das telas protegidas (estilização global)
    ├── index.jsx                   → Home protegida (lista de atendimentos principais)
    ├── adicionar.jsx               → Novo atendimento de violação de direitos
    ├── [id].jsx                    → Detalhes e edição de atendimentos de violação de direitos
    ├── busca-atendimentos.jsx      → Consulta e busca de atendimentos de violação de direitos
    ├── novo-acompanhamento.jsx     → registro de novo acompanhamento para o atendimento de violação de direitos (sub-registro de histórico)
    ├── tipo-atendimento.jsx        → Seleção do tipo de atendimento a iniciar
    ├── adicionar-diverso.jsx       → Novo atendimento diverso
    ├── diversos-atendimentos.jsx   → Lista de atendimentos diversos
    ├── diverso/
    │   ├── _layout.jsx             → Layout específico da seção de diversos
    │   └── [id].jsx                → Detalhes e edição de atendimentos diversos
    ├── adicionar-denuncia.jsx      → Nova denúncia
    ├── lista-denuncias.jsx         → Lista e busca de denúncias
    ├── denuncia/
    │   ├── _layout.jsx             → Layout específico da seção de denúncias
    │   └── [id].jsx                → Detalhes e edição de denúncias
```

## Funcionalidades Principais

- Autenticação segura com email e senha (Firebase Auth)
- Registro, edição, exclusão e consulta de atendimentos (Firestore)
- Cadastro de atendimentos diversos e denúncias
- Histórico de acompanhamento por atendimento
- Busca por nome, CPF, motivo, etc.
- Navegação protegida (telas só acessíveis logado)

## Trabalho de Extensão

**Aluno**: Gean Lucas Alves Rodrigues  
**Curso**: Análise e Desenvolvimento de Sistemas  
**Instituição**: Estácio  
**Projeto de Extensão**: Desenvolvimento de aplicativo para suporte ao Conselho Tutelar no registro e acompanhamento de violações de direitos de crianças e adolescentes.

