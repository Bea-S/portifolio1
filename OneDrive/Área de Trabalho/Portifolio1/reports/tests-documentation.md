Documentação de Testes — Projeto To-Do (QA)
=============================================

Sumário
-------
- Objetivo
- Suites de teste
  - `tests/qa.spec.js` (QA Scenarios)
  - `tests/todo.spec.js` (To-Do List)
- Como executar
- Artefatos gerados
- Como debugar falhas
- Boas práticas para adicionar novos testes

Objetivo
--------
Descrever os testes automatizados (Playwright) do projeto, informar como executar localmente, onde encontrar artefatos e como estender a suíte.

Ambiente mínimo
---------------
- Node.js (versão compatível com seu `package.json`)
- Dependências instaladas: `npm install`
- Playwright instalado via pacote dev e navegadores instalados: `npx playwright install` (se necessário)
- Executar servidor local antes dos testes: `node server.js` (padrão: http://127.0.0.1:4173)

Suites de teste
---------------
1) tests/qa.spec.js — *QA Scenarios - To-Do List*
   - Antes de cada caso: navega para `/`, limpa `localStorage` e recarrega a página.
   - Casos de teste incluídos:
     - `Adicionar tarefa - positivo` — cria uma tarefa válida e verifica presença e texto.
     - `Adicionar tarefa - negativos (vazio e apenas espaços)` — garante que entradas vazias não criam tarefas.
     - `Adicionar tarefa - muito grande, caracteres especiais e duplicatas` — valida comportamento com textos longos, caracteres especiais e duplicatas.
     - `Editar tarefa - salvar e cancelar` — cobre salvar edição, cancelar edição e tentativa de salvar texto vazio.
     - `Editar tarefa concluída mantém status e permite edição` — garante que uma tarefa marcada continua `completed` após edição.
     - `Concluir e reabrir tarefa + persistência` — marca tarefa como concluída, verifica persistência após reload e reabre.
     - `Excluir tarefa - confirmar e cancelar` — testa comportamento de diálogo de confirmação para exclusão (dismiss/accept).

2) tests/todo.spec.js — *To-Do List* (E2E básicos)
   - Antes de cada caso: navega para `/`, limpa `localStorage` e recarrega a página.
   - Casos de teste incluídos:
     - `deve criar uma tarefa com sucesso` — cria e verifica tarefa.
     - `nao deve permitir criar tarefa vazia` — valida estado vazio e mensagem de empty state.
     - `deve editar uma tarefa existente` — edita e verifica o texto atualizado.
     - `deve marcar e reabrir uma tarefa` — marca/desmarca e verifica classe `completed`.
     - `deve excluir uma tarefa` — exclui e verifica que lista ficou vazia.
     - `deve filtrar tarefas por status` — testa os filtros `active`, `completed`, `all`.
     - `deve manter tarefas persistidas no navegador` — verifica persistência após reload.

Como executar os testes localmente
---------------------------------
1. Instale dependências:

```bash
npm install
```

2. Instale navegadores Playwright (se ainda não estiverem instalados):

```bash
npx playwright install
```

3. Inicie o servidor da aplicação (na raiz do projeto):

```bash
node server.js
# ou
npm start
```

4. Rode toda a suíte Playwright:

```bash
npx playwright test -c playwright.config.js
```

5. Rodar um único arquivo de teste:

```bash
npx playwright test tests/qa.spec.js -c playwright.config.js --reporter=list
npx playwright test tests/todo.spec.js -c playwright.config.js --reporter=list
```

6. Executar um teste específico (nome do teste):

```bash
npx playwright test -g "Adicionar tarefa - positivo"
```

Artefatos gerados
-----------------
- Relatórios e traces do Playwright: diretório `test-results/` e `playwright-report/` (dependendo da configuração do runner)
- Prints/screenshots em `test-results/*` quando testes falham (ver `playwright.config.js` para caminhos)
- Arquivos de log e traces podem ser anexados à issue/PR (veja `reports/` para artefatos já gerados)

Boas práticas de debugging
-------------------------
- Reproduza localmente abrindo o app em `http://127.0.0.1:4173` e seguindo os passos do teste falho.
- Use `npx playwright test --debug` para abrir o inspector do Playwright.
- Colete traces no Playwright adicionando `--trace=on` ou revisando `test-results/*/trace.zip`.
- Verifique `localStorage` na aba Console do navegador para garantir que os dados foram persistidos corretamente.

Dicas para escrita de novos testes
---------------------------------
- Mantenha cada teste independente: use `localStorage.clear()` no `beforeEach` quando necessário.
- Prefira seletores estáveis: adicione `data-testid` ou `data-test` no HTML para facilitar localização de elementos.
- Teste fluxos reais do usuário: criar → editar → marcar → filtrar → excluir.
- Para testes de persistência, sempre valide após `page.reload()`.

Checklist ao commitar testes
---------------------------
- [ ] Testes são determinísticos (não dependem de ordenação ou dados externos)
- [ ] Seletores estão estáveis (não dependem de texto mutável)
- [ ] Artefatos de teste não são committados (`.gitignore` tem `test-results/` e `playwright-report/`)
- [ ] CI executa `npx playwright install` antes de executar os testes

Onde ler/editar os testes
-------------------------
- Suite completa: `tests/qa.spec.js` e `tests/todo.spec.js`
- Configuração Playwright: `playwright.config.js`
- Scripts e server: `server.js`, `package.json` (scripts)

Contato / Próximos passos sugeridos
----------------------------------
- Adicionar testes unitários para funções puras (`saveTasks`, `loadTasks`) com mocks de `localStorage`.
- Criar job CI (GitHub Actions) que instale dependências, rode `npx playwright install` e execute `npx playwright test` em runners Linux/Windows/Mac conforme necessário.

---
Arquivo gerado automaticamente pelo assistente de desenvolvimento.
