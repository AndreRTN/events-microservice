# Events Microservice

Microserviço para coleta e processamento de eventos em tempo real, desenvolvido com Next.js e Prisma.

## Como Rodar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação e Execução

1. **Clone e instale depend�ncias:**
```bash
git clone 
cd events-microservice
npm install
```

2. **Configure o banco de dados:**
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular com dados de teste (opcional)
npm run db:seed
```

3. **Execute em desenvolvimento:**
```bash
npm run dev
```

4. **Execute com Docker:**
```bash
# Build da imagem
./docker-build.sh

# Execute com docker-compose
docker-compose up
```

A aplicação estará disponível em `http://localhost:3000`

## >> Como Testar

### Testes Automatizados
```bash
# Executar todos os testes
npm test

# Cobertura de testes
npm run test:coverage
```

### Teste Manual da API

**1. Teste de sa�de:**
```bash
curl http://localhost:3000/api/health
```

**2. Enviar eventos (requer API key):**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "events": [
      {
        "id": "event-001",
        "type": "sent",
        "email": "user@example.com",
        "site": "example.com",
        "timestamp": "2024-01-01T10:00:00Z",
        "metadata": {
          "campaign": "newsletter",
          "messageId": "msg-123"
        }
      }
    ]
  }'
```

**3. Consultar estatísticas:**
```bash
curl "http://localhost:3000/api/stats?site=example.com&from=2024-01-01&to=2024-01-31"
```

**4. Estatísticas diárias:**
```bash
curl "http://localhost:3000/api/stats/daily?site=example.com&from=2024-01-01&to=2024-01-31"
```

**5. Métricas do sistema:**
```bash
curl http://localhost:3000/api/metrics
```

## Decisões de Arquitetura

### Estrutura do Projeto
```
src/
 app/api/          # Endpoints da API
 lib/              # Utilitarios e configurações
 services/         # Lógica de negócio
 repositories/     # Acesso aos dados
 tests/            # Testes unitários e integração
 prisma/           # Schema e migrations
```

### Tecnologias Escolhidas

**Next.js App Router:**
- Framework full-stack com API routes nativas
- Ótima performance e developer experience
- TypeScript first-class support

**Prisma + SQLite:**
- ORM type-safe para desenvolvimento
- SQLite para simplicidade (pode migrar para PostgreSQL)
- Migrations autom�ticas

**Arquitetura em Camadas:**
- **Controllers (API Routes):** Validação e autenticação
- **Services:** Lógica de neg�cio e regras
- **Repositories:** Abstração do banco de dados
- **Models:** Tipos TypeScript e validações

**Autentica��o por API Key:**
- Simples e eficaz para APIs internas
- Middleware reutilizável
- Facilmente extensível para JWT/OAuth

**Sistema de M�tricas:**
- Contadores em memória para performance
- Métricas básicas de API e eventos
- Preparado para integração com Prometheus


## � Limitações

### Performance
- **SQLite:** Adequado para desenvolvimento, limitado em produção
- **Métricas em memória:** Perdidas ao reiniciar
- **Sem cache:** Todas as consultas vão direto ao banco

### Escalabilidade
- **Single instance:** Não suporta múltiplas instâncias
- **Sem rate limiting:** API pode ser sobrecarregada
- **Processamento síncrono:** Eventos processados um a um

## =' Scripts Dispon�veis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm run start        # Executar build de produção
npm run lint         # Executar ESLint
npm test             # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Relatório de cobertura
npm run db:generate  # Gerar cliente Prisma
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados de teste
```