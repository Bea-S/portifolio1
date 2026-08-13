# [BUG-001] Tarefa concluída volta para pendente após recarregar a página

**Descrição**
Ao marcar uma tarefa como concluída na aplicação web e recarregar a página, o status volta para pendente (checkbox desmarcado). Isso indica problema de persistência do estado no `localStorage`.

**Passos para reproduzir**
1. Abrir a aplicação: `http://127.0.0.1:4173`
2. Criar uma nova tarefa (ex.: "Tarefa persistência")
3. Marcar a tarefa como concluída (clicar no checkbox)
4. Recarregar a página (F5)

**Resultado esperado**
A tarefa permanece com o status concluída (checkbox marcado e classe `completed`).

**Resultado atual**
A tarefa aparece como pendente (checkbox desmarcado) após recarregar a página.

**Severidade:** Medium
**Prioridade:** P2
**Labels:** bug, persistence, localStorage

**Ambiente**
- OS: Windows
- Node.js: (local)
- Execução: `node server.js` ou `npx http-server . -p 4173`
- Arquivos relevantes: `app.js`, `server.js`, `tests/qa.spec.js`

**Evidências**
- Teste Playwright: `tests/qa.spec.js` → `Concluir e reabrir tarefa + persistência` (falha ao reproduzir manualmente em CI experimentado)
- Diretório com artefatos gerados: `test-results/` (trace, screenshots)

**Diagnóstico inicial / Hipóteses**
- A chave usada em `localStorage` pode estar inconsistente entre leitura (`loadTasks`) e gravação (`saveTasks`).
- `toggleTaskStatus` pode não chamar `saveTasks()` corretamente antes do reload.
- Operações de edição/exclusão podem reatribuir `state.tasks` sem persistir.

**Sugestão de correção**
1. Revisar `loadTasks()` e `saveTasks()` no `app.js` para garantir mesma `STORAGE_KEY` e formato de serialização.
2. Garantir que `saveTasks()` seja chamado após qualquer mutação em `state.tasks` (add, update, delete, toggle).
3. Adicionar cobertura de teste unitário para funções que interagem com `localStorage` (mocks) e testes E2E que confirmem persistência após reload.

**Passos para a issue**
- Assignee: `@dev` (placeholder)
- Milestone: `v1.0.0` (opcional)
- Attachments: anexar `test-results/*/test-failed-1.png` e `test-results/*/trace.zip` correspondentes

**Checklist para resolver**
- [ ] Reproduzir bug localmente e anexar evidências
- [ ] Escrever teste unitário para `saveTasks`/`loadTasks`
- [ ] Corrigir persistência no `app.js`
- [ ] Rodar suíte Playwright e confirmar todos os testes passarem
- [ ] Fechar issue com referência ao commit/PR

---
*Gerado automaticamente pelo assistente de desenvolvimento.*
