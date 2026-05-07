# ARCA App - Desafio Tecnico Frontend

Aplicacao web do ARCA, desenvolvida como solucao para o desafio tecnico de Desenvolvimento Frontend da SIAPESQ. Este repositorio e um fork do desafio original e foi evoluido para entregar a interface principal do produto: autenticacao, gestao de especies, dashboard, mapa interativo e empacotamento desktop com Electron.

## Links da entrega

| Item | Link |
| --- | --- |
| Repositorio frontend | https://github.com/Michelangelo-Costa/desafio-2026-FRONT-END |
| Aplicacao publicada | https://app-arca.michelangelocosta.dev/#/login |
| API Node integrada | https://github.com/Michelangelo-Costa/desafio-2026-API-NODE |
| Site vitrine do ARCA | https://github.com/Michelangelo-Costa/arca-site |
| Site publicado | https://arca-site.michelangelocosta.dev/ |
| Desafio original | https://github.com/siapesq/desafio-2026-FRONT-END |

## Visao geral

O ARCA e uma interface para monitoramento inteligente de especies. A aplicacao consome a API Node do projeto para autenticar usuarios, registrar especies e apresentar estatisticas para acompanhamento operacional.

Principais areas da aplicacao:

- Login, cadastro, recuperacao de senha, redefinicao e troca de senha.
- Rotas protegidas e persistencia de sessao por token JWT.
- Listagem de especies com busca, filtro por categoria, paginacao e alternancia entre tabela e grade.
- Cadastro, edicao, detalhe e exclusao de especies com validacao via React Hook Form e Zod.
- Controle de permissao por autor do registro, alinhado ao campo `createdById` retornado pela API.
- Dashboard com cards, graficos por categoria, status, periodo e localidades.
- Mapa interativo com Leaflet, marcadores, camadas visuais e modo heatmap.
- Exportacao de registros em `.xlsx`.
- Preparacao para desktop com Electron e `electron-builder`.

## Repositorios relacionados

| Repositorio | Papel no ecossistema |
| --- | --- |
| [desafio-2026-FRONT-END](https://github.com/Michelangelo-Costa/desafio-2026-FRONT-END) | App web e base do app desktop ARCA. |
| [desafio-2026-API-NODE](https://github.com/Michelangelo-Costa/desafio-2026-API-NODE) | Backend Express/Prisma responsavel por auth, especies, estatisticas e integracao externa. |
| [arca-site](https://github.com/Michelangelo-Costa/arca-site) | Site publico de apresentacao do ARCA, com chamada para download do instalador. |

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form + Zod
- Recharts
- Leaflet + React Leaflet + leaflet.heat
- XLSX
- Electron + electron-builder

## Como executar localmente

Requisitos:

- Node.js 20 ou superior
- npm
- API Node rodando localmente ou URL de API publicada

Instale as dependencias:

```bash
npm install
```

Configure as variaveis de ambiente:

```bash
cp .env.example .env
```

Exemplo de `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Inicie em desenvolvimento:

```bash
npm run dev
```

O Vite abre a aplicacao em `http://localhost:5173`.

## Integracao com a API

O frontend espera a API do repositorio [desafio-2026-API-NODE](https://github.com/Michelangelo-Costa/desafio-2026-API-NODE). As chamadas principais usam os grupos:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/change-password`
- `GET /species`
- `GET /species/stats`
- `GET /species/:id`
- `POST /species`
- `PUT /species/:id`
- `DELETE /species/:id`

Para rodar o fluxo completo localmente, suba a API antes do front e aponte `VITE_API_URL` para ela.

## Scripts

```bash
npm run dev          # desenvolvimento web
npm run build        # build de producao
npm run preview      # preview local do build
npm run lint         # analise com ESLint
npm run desktop:dev  # build web e abre no Electron
npm run desktop:pack # empacota em modo diretorio
npm run desktop:dist # gera instalador desktop
```

## Build

```bash
npm run build
```

O resultado web fica em `dist/`.

Para gerar o instalador Windows:

```bash
npm run desktop:dist
```

Os artefatos desktop ficam em `release/`.

## Observacoes para avaliacao

- O repositorio foi mantido como fork do desafio para preservar rastreabilidade.
- A aplicacao publicada esta em `https://app-arca.michelangelocosta.dev/#/login`.
- O backend possui README proprio e documenta variaveis, rotas, Prisma, Swagger e execucao local.
- O site vitrine possui README proprio e conecta o produto ao download do instalador.
