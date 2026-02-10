# Menu API - API Educacional de Restaurante

## Problema Original
API de restaurante para fins educacionais, permitindo que alunos aprendam a criar páginas front-end dinâmicas consumindo dados de uma API RESTful.

## Arquitetura
- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Banco de Dados**: MongoDB (coleção: produtos)

## User Personas
1. **Estudantes**: Aprendendo a consumir APIs REST em aplicações frontend
2. **Educadores**: Usando a API como material didático

## Requisitos Core (Implementado)
- [x] CRUD completo de produtos via API REST
- [x] Campos: id, nome, descricao, categoria, preco, imagem, destacado
- [x] Categorias: Entradas, Pratos Principais, Sobremesas, Bebidas
- [x] Filtros por categoria e destacado
- [x] 15 produtos de exemplo em português
- [x] Painel administrativo (sem autenticação)
- [x] Documentação da API com exemplos de código
- [x] Dark mode

## O que foi Implementado (10/02/2026)
### Backend
- GET /api/produtos - Listar todos (com filtros)
- GET /api/produtos/{id} - Obter por ID
- GET /api/produtos/categoria/{categoria} - Por categoria
- POST /api/produtos - Criar produto
- PUT /api/produtos/{id} - Atualizar produto
- DELETE /api/produtos/{id} - Remover produto
- GET /api/stats - Estatísticas
- GET /api/categorias - Listar categorias
- POST /api/seed - Popular banco

### Frontend
- Dashboard com estatísticas e produtos destacados
- Listagem de produtos com filtros e busca
- Formulário de criação de produto
- Formulário de edição de produto
- Documentação da API interativa

## Backlog
### P0 (Crítico) - ✅ Completo
### P1 (Importante)
- [ ] Paginação na listagem de produtos
- [ ] Upload de imagem (ao invés de URL)

### P2 (Desejável)
- [ ] Ordenação por preço/nome
- [ ] Exportar dados em CSV/JSON
- [ ] Modo de visualização (lista/grid)

## Próximas Tarefas
1. Adicionar paginação se necessário para muitos produtos
2. Implementar validação de URL de imagem
3. Adicionar mais exemplos de código na documentação (React, Vue, Angular)
