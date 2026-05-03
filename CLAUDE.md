# SIAPESQ - Sistema de Gestão de Espécies (Frontend)

## Visão Geral
Aplicação web de monitoramento e gestão de espécies da biodiversidade brasileira. O sistema é chamado **ARCA** dentro do ecossistema **SIAPESQ**. A intenção futura é empacotar com **Electron** como aplicativo desktop, com uma landing page separada para download.

## Stack Técnica
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 3.4** (darkMode: 'class')
- **React Router DOM 7** (createBrowserRouter)
- **React Hook Form** + **Zod** (validação)
- **Recharts** (gráficos do dashboard)
- **Leaflet** + **React-Leaflet** (mapas, incluindo heatmap e NASA GIBS)
- **Axios** (HTTP client)
- **XLSX** (exportação Excel)
- **Lucide React** (ícones)

## Estrutura de Pastas
```
src/
├── components/
│   ├── layout/        → Sidebar, Header, PageWrapper, ProtectedRoute
│   ├── charts/        → StatsCards, CategoryChart, CategoryDonut, StatusChart, MonthlyChart, TopLocationsChart
│   └── ui/            → Button, Badge, Input, Spinner
├── pages/             → Dashboard, Login, SpeciesList, SpeciesDetail, SpeciesCreate, MapPage, ProfilePage, SettingsPage, NotFound
├── contexts/          → ThemeContext (dark mode), SettingsContext (preferências persistidas)
├── hooks/             → useSpecies (list/detail/stats), useSpeciesForm (create/edit com Zod), useDebounce
├── services/          → api.ts (axios instance), authService.ts (JWT), speciesService.ts (CRUD + stats)
├── types/             → species.ts (Species, SpeciesStats, SpeciesCategory)
├── utils/             → categoryColors, formatDate, mockData
├── router/            → index.tsx (AppLayout + rotas)
├── App.tsx            → ThemeProvider > SettingsProvider > RouterProvider
└── index.css          → Tailwind + dark mode overrides + wave animations
```

## Cores e Identidade Visual
Paleta definida em `tailwind.config.js`:
- **navy**: #0D2B5E (principal), navy-mid: #1B4F8A, navy-light: #2563A8
- **teal**: #00B4A6 (acento), teal-light: #4ECDC4
- **siapesq-green**: #8DC63F
- **siapesq-surface**: #F5F8FF (fundo claro)
- **siapesq-border**: #D6E4F0
- **siapesq-muted**: #6B7F99 (texto secundário)
- **siapesq-dark**: #1A2E4A (texto principal)

Fonte: Inter (Google Fonts)

## Backend
- API REST rodando em `http://localhost:3000` (configurável via `VITE_API_URL` no `.env`)
- Projeto separado em `desafio-2026-API-NODE` (Node.js + Express + banco de dados)
- Se `VITE_API_URL` não estiver definida, usa dados mock locais
- Autenticação via JWT (Bearer token)

## Funcionalidades Implementadas

### Autenticação
- Login com e-mail/senha via JWT
- ProtectedRoute redireciona para /login se não autenticado
- Logout limpa token do localStorage

### Dashboard (/)
- Banner hero com gradiente azul→teal, ondas SVG decorativas e atalhos rápidos
- Stats cards com gradientes coloridos (Total, Aves, Peixes, Plantas)
- Gráficos: categoria por trimestre, donut, status de conservação, registros mensais, top localizações
- Tabela de registros recentes com scroll horizontal no mobile
- Exportação para Excel (.xlsx)

### Espécies (/species)
- Lista com visualização tabela e grade
- Busca por nome/nome científico com debounce
- Filtro por categoria
- Paginação
- **Excluir** espécie com confirmação (chama DELETE no backend)
- Botão editar leva para detalhe da espécie

### Criar Espécie (/species/new)
- Formulário com validação Zod
- Campos: nome comum, nome científico, categoria, **status de conservação**, data, lat/long, localização, abundância (slider 1-10), notas
- Status de conservação: População Estável, Pouco Preocupante, Vulnerável, Em Perigo

### Detalhe da Espécie (/species/:id)
- Banner hero com badge de status colorido (verde/amarelo/vermelho conforme gravidade)
- **Mapa interativo** (arrastável, zoom) com marcador colorido por categoria
- Taxonomia e metadados (categoria, status, data, identificador, localização)
- Notas de campo
- **Botão editar** → abre formulário inline com todos dados pré-preenchidos
- **Botão excluir** → confirmação + DELETE no backend + redireciona para lista

### Mapa (/map)
- Leaflet com marcadores coloridos por categoria
- Modo mapa de calor (heatmap baseado em abundância)
- Camadas NASA GIBS: cor real, NDVI vegetação, temp. do mar, clorofila, temp. terrestre
- Filtros de categoria
- Legendas dinâmicas

### Perfil (/profile)
- Avatar com upload de foto (salva em localStorage como base64)
- Nome de exibição editável
- Avatar aparece no header (canto superior direito)

### Configurações (/settings)
- Todas as preferências persistem no localStorage via SettingsContext
- Dark mode (toggle funcional via ThemeContext)
- Visualização compacta
- Idioma, formato de data, formato de exportação
- Toggles de notificação

## Responsividade
- **Sidebar**: esconde no mobile (< lg), vira drawer deslizante com overlay z-9999
- **Hamburger**: ícone estilizado com linhas em formato de onda (animam no hover)
- **Header**: mostra nome da página atual ao invés de nav links fixos
- **Todos os grids**: `grid-cols-1` no mobile, expandem conforme breakpoint
- **Tabelas**: scroll horizontal com `min-w-[600-700px]`
- **Formulários**: campos empilham verticalmente no mobile
- **PageWrapper**: padding responsivo (p-3 sm:p-4 lg:p-6)

## Species Service API
```typescript
speciesService.getAll(params?)    // GET /species
speciesService.getById(id)        // GET /species/:id
speciesService.create(data)       // POST /species
speciesService.update(id, data)   // PUT /species/:id
speciesService.delete(id)         // DELETE /species/:id
speciesService.getStats()         // GET /species/stats
```

## Species Type
```typescript
interface Species {
  id: string
  commonName: string
  scientificName: string
  category: 'Bird' | 'Fish' | 'Plant' | 'Mammal' | 'Reptile' | 'Other'
  latitude: number
  longitude: number
  location: string
  observationDate: string
  notes?: string
  status?: 'Stable Population' | 'Endangered' | 'Vulnerable' | 'Least Concern'
  uniqueIdentifier?: string
  abundance?: number
}
```

## Rotas
| Rota | Página | Protegida |
|------|--------|-----------|
| /login | Login | Não |
| / | Dashboard | Sim |
| /species | SpeciesList | Sim |
| /species/new | SpeciesCreate | Sim |
| /species/:id | SpeciesDetail | Sim |
| /map | MapPage | Sim |
| /settings | SettingsPage | Sim |
| /profile | ProfilePage | Sim |

## Comandos
```bash
npm run dev      # Inicia dev server (Vite)
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Pendências / Próximos Passos
- Tela de cadastro de usuário (registro)
- Empacotamento com Electron (desktop app)
- Landing page separada com download do app
- Hospedagem do backend
- Dark mode nas tabelas e alguns componentes pode precisar de ajustes finos
