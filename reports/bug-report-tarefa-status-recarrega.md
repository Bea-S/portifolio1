# Bug: Tarefa concluída volta para pendente após recarregar a página

- **ID:** BUG-001
- **Projeto:** To-Do List QA Project
- **Autor:** Gerado automaticamente
- **Data:** 2026-08-13
- **Ambiente:** Windows, Node.js, app estática carregada via `server.js` (http://127.0.0.1:4173)
- **Versão:** código local

## Resumo
Ao marcar uma tarefa como concluída, após recarregar a página o status é perdido e a tarefa volta para pendente.

## Passos para reproduzir
1. Abra a aplicação em http://127.0.0.1:4173
2. Crie uma nova tarefa (ex.: "Tarefa persistência")
3. Marque a tarefa como concluída (clique no checkbox)
4. Recarregue a página (F5)

## Resultado esperado
A tarefa permanece com o status **concluída** (checkbox marcado e classe `completed`).

## Resultado atual
A tarefa aparece como pendente (checkbox desmarcado) após o reload.

## Severidade
Média — afeta a persistência/estado do usuário, confunde o comportamento esperado.

## Probabilidade de ocorrência
Alta — facilmente reproduzível conforme passos acima.

## Evidências
- Execução automática: teste Playwright `QA Scenarios - To-Do List › Concluir e reabrir tarefa + persistência` (tests/qa.spec.js).
- Logs/trace: ver diretório `test-results/` gerado pelo Playwright com trace e screenshot do caso falho.
- Screenshot/trace podem ser abertos localmente:
  - `test-results/<caso>/trace.zip`
  - `test-results/<caso>/test-failed-1.png`

## Diagnóstico inicial (hipóteses)
- Possível problema na serialização / leitura do `localStorage` (nomes de chave diferentes entre leitura/gravação).
- Inserção/atualização do campo `completed` não persiste corretamente antes do `saveTasks()`.

## Passos para reproduzir manualmente com cURL (API)
Esta aplicação armazena no `localStorage` do navegador; não há API REST para persistência por padrão.

## Sugestão de correção
1. Verificar a função `toggleTaskStatus` em `app.js` e garantir que `saveTasks()` seja chamado após alternar o status.
2. Confirmar chave `STORAGE_KEY` consistente entre `loadTasks()` e `saveTasks()`.
3. Adicionar testes unitários que simulem `localStorage` para verificar persistência.

## Notas
Se precisar, posso abrir uma branch `fix/persistence-localstorage` e implementar a correção com testes automatizados.
