const { test, expect } = require('@playwright/test');

test.describe('To-Do List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('deve criar uma tarefa com sucesso', async ({ page }) => {
    await page.fill('#task-input', 'Estudar QA');
    await page.click('#submit-button');

    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toHaveText(['Estudar QA']);
  });

  test('nao deve permitir criar tarefa vazia', async ({ page }) => {
    await page.fill('#task-input', '   ');
    await page.click('#submit-button');

    await expect(page.locator('.task-item')).toHaveCount(0);
    await expect(page.locator('#empty-state')).toBeVisible();
  });

  test('deve editar uma tarefa existente', async ({ page }) => {
    await page.fill('#task-input', 'Tarefa inicial');
    await page.click('#submit-button');

    await page.locator('.edit-btn').click();
    await page.fill('#task-input', 'Tarefa atualizada');
    await page.click('#submit-button');

    await expect(page.locator('.task-text')).toHaveText(['Tarefa atualizada']);
  });

  test('deve marcar e reabrir uma tarefa', async ({ page }) => {
    await page.fill('#task-input', 'Revisar testes');
    await page.click('#submit-button');

    await page.locator('input[type="checkbox"]').check();
    await expect(page.locator('.task-item')).toHaveClass(/completed/);

    await page.locator('input[type="checkbox"]').uncheck();
    await expect(page.locator('.task-item')).not.toHaveClass(/completed/);
  });

  test('deve excluir uma tarefa', async ({ page }) => {
    await page.fill('#task-input', 'Excluir esta tarefa');
    await page.click('#submit-button');

    await page.locator('.delete-btn').click();

    await expect(page.locator('.task-item')).toHaveCount(0);
  });

  test('deve filtrar tarefas por status', async ({ page }) => {
    await page.fill('#task-input', 'Ativa');
    await page.click('#submit-button');
    await page.fill('#task-input', 'Concluída');
    await page.click('#submit-button');

    await page.locator('input[type="checkbox"]').first().check();

    await page.click('[data-filter="active"]');
    await expect(page.locator('.task-text')).toHaveText(['Ativa']);

    await page.click('[data-filter="completed"]');
    await expect(page.locator('.task-text')).toHaveText(['Concluída']);

    await page.click('[data-filter="all"]');
    await expect(page.locator('.task-item')).toHaveCount(2);
  });

  test('deve manter tarefas persistidas no navegador', async ({ page }) => {
    await page.fill('#task-input', 'Persistir tarefa');
    await page.click('#submit-button');

    await page.reload();

    await expect(page.locator('.task-text')).toHaveText(['Persistir tarefa']);
  });
});
