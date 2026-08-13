# To-Do List QA Project

Aplicação web de gerenciamento de tarefas desenvolvida para estudo de Quality Assurance (QA), com foco em testes funcionais, de regressão e automação.

## Objetivo

Validar se a aplicação atende aos requisitos de:

- criação de tarefas
- edição de tarefas
- marcação e reabertura de status
- exclusão de tarefas
- visualização por filtros
- persistência no navegador

## Funcionalidades implementadas

- Criar novas tarefas
- Editar tarefas existentes
- Marcar como concluída / reabrir
- Excluir tarefas
- Filtrar por `Todas`, `Ativas` e `Concluídas`
- Persistir tarefas em `localStorage`

## Estrutura do projeto

- `index.html` — estrutura da interface
- `styles.css` — estilos visuais
- `app.js` — lógica da aplicação
- `tests/todo.spec.js` — testes automatizados via Playwright
- `playwright.config.js` — configuração do ambiente de testes

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute a aplicação:
   ```bash
   npm start
   ```

3. Acesse a URL:
   ```text
   http://127.0.0.1:4173
   ```

4. Rode os testes automatizados:
   ```bash
   npm run test:e2e
   ```

## Casos de teste planejados

### Testes manuais

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| TC-01 | Adicionar tarefa válida | Tarefa aparece na lista |
| TC-02 | Adicionar tarefa vazia | Nenhuma tarefa é criada |
| TC-03 | Editar tarefa | Texto atualizado na lista |
| TC-04 | Marcar tarefa como concluída | Tarefa recebe status concluído |
| TC-05 | Reabrir tarefa concluída | Checkbox é desmarcado e tarefa volta ao estado ativo |
| TC-06 | Excluir tarefa | Item é removido da lista |
| TC-07 | Filtro de tarefas ativas | Só aparecem itens não concluídos |
| TC-08 | Filtro de tarefas concluídas | Só aparecem itens concluídos |
| TC-09 | Persistência no navegador | Tarefas permanecem após recarga |

### Técnicas de QA aplicadas

- Particionamento de equivalência
- Tabela de decisão
- Testes positivos e negativos
- Testes exploratórios
- Automação de testes com Playwright

## Observações gerais

A aplicação foi criada como objeto de estudo para prática de QA em ambiente Web, priorizando validação funcional e documentação dos cenários de teste.
