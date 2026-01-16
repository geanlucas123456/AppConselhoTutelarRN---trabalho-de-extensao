# App Conselho Tutelar

Aplicativo mobile para gerenciamento de atendimentos e denúncias do Conselho Tutelar.

## Tecnologias
- React Native + Expo
- Firebase (Firestore + Auth)
- Expo Router

## Como rodar
1. Clone o repositório
2. `npm install`
3. `npx expo start`

## Estrutura principal
- **app/_layout.jsx** → Layout raiz (autenticação + proteção de rotas)
- **app/index.jsx** → Tela de entrada/transição (opcional)
- **app/(auth)/login.jsx** → Tela de login
- **app/(app)/_layout.jsx** → estilização
- **app/(app)/[id].jsx** → detalhes e edição de atendimentos de violação de direitos
- **app/(app)/index.jsx** → Home protegida (lista de atendimentos)
- **app/(app)/adicionar.jsx** → Novo atendimento de violação de direito
- **app/(app)/adicionar-denuncia.jsx** → Nova denúncia
- **app/(app)/adicionar-diverso.jsx** → Novo atendimento diverso
- **app/(app)/lista-denuncias.jsx** → lista/registros, e busca de denúncias
- **app/(app)/lista-diversos.jsx** → lista/registros, e busca de atendimentos diversos
- **app/(app)/novo-acompanhamento.jsx** → Novo acompanhamento (sub-registro)
- **app/(app)/tipo-atendimento.jsx** → selecionar qual tipo de atendimento será iniciado
- **app/(app)/busca-atendimentos.jsx** → lista/registros, e busca de atendimentos de violação de direitos
- **app/(app)/diverso/_layout.jsx** → estilização
- **app/(app)/diverso/[id].jsx** → Detalhes e edição de atendimentos diversos
- **app/(app)/denuncia/_layout.jsx** → estilização
- **app/(app)/denuncia/[id].jsx** → ~detalhes e edição dos registros de denúncias


Trabalho de Extensão - [Gean Luca Alves Rodrigues] - [Analise e desenvolvimento de sistemas/Estácio]
