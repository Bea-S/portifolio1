Título: Fix: persiste o estado concluído da tarefa no localStorage (BUG-001)

## Resumo
Corrige o BUG-001 em que tarefas marcadas como concluídas voltam para pendentes após recarregar a página. A correção garante que o estado das tarefas seja persistido corretamente no `localStorage` e restaurado com o valor booleano correto no campo `completed`.

## O que foi alterado
- Normalização dos itens carregados do `localStorage` para garantir tipos consistentes; especialmente `completed` como boolean.
- Garantia de persistência imediata após mutações em `state.tasks` (toggle, add, update, delete).
- Validação com testes E2E do Playwright (`tests/qa.spec.js`) confirmando persistência após reload.

## Como testar
1. Inicie a aplicação:
   ```bash
   node server.js
   ```
2. Abra a aplicação no navegador (`http://127.0.0.1:4173`).
3. Crie uma tarefa e marque-a como concluída.
4. Recarregue a página.
5. Verifique que o checkbox continua marcado e que a tarefa possui a classe `completed`.

## Validação automatizada
Execute:
```bash
npx playwright test tests/qa.spec.js -c playwright.config.js --reporter=list
```
Esperado: todos os testes relacionados à persistência passam (localmente verificado: 7 passed).

## Related
Fecha o BUG-001

---
Arquivo gerado automaticamente pelo assistente de desenvolvimento; cole este conteúdo como descrição ao abrir a PR em:
https://github.com/Bea-S/portifolio1/compare/main...fix/bug-001-persistence?expand=1
