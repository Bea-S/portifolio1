const { test, expect } = require('@playwright/test');

test.describe('QA Scenarios - To-Do List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Adicionar tarefa - positivo', async ({ page }) => {
    await page.fill('#task-input', 'Estudar Playwright');
    await page.click('#submit-button');

    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toHaveText(['Estudar Playwright']);
  });

  test('Adicionar tarefa - negativos (vazio e apenas espaços)', async ({ page }) => {
    await page.fill('#task-input', '');
    await page.click('#submit-button');
    await expect(page.locator('.task-item')).toHaveCount(0);

    await page.fill('#task-input', '   ');
    await page.click('#submit-button');
    await expect(page.locator('.task-item')).toHaveCount(0);
  });

  test('Adicionar tarefa - muito grande, caracteres especiais e duplicatas', async ({ page }) => {
    // Muito grande (>120)
    const longText = 'A'.repeat(130);
    await page.fill('#task-input', longText);
    await page.click('#submit-button');

    // App trims and accepts input via UI maxlength, but programmatic fill may add it — expect a task created
    await expect(page.locator('.task-item')).toHaveCount(1);

    // Caracteres especiais
    await page.fill('#task-input', '!@#$%^&*()_+õçü');
    await page.click('#submit-button');
    await expect(page.locator('.task-text', { hasText: '!@#$%^&*()_+õçü' })).toHaveCount(1);

    // Duplicatas (adicionar mesma tarefa duas vezes)
    await page.fill('#task-input', 'Duplicada');
    await page.click('#submit-button');
    await page.fill('#task-input', 'Duplicada');
    await page.click('#submit-button');
    await expect(page.locator('.task-text', { hasText: 'Duplicada' })).toHaveCount(2);
    await expect(page.locator('.task-item')).toHaveCount(4);
  });

  test('Editar tarefa - salvar e cancelar', async ({ page }) => {
    await page.fill('#task-input', 'Tarefa editar');
    await page.click('#submit-button');

    await page.locator('.edit-btn').click();
    await page.fill('#task-input', 'Tarefa editada');
    await page.click('#submit-button');
    await expect(page.locator('.task-text')).toHaveText(['Tarefa editada']);

    // Cancelar edição
    await page.locator('.edit-btn').click();
    await page.fill('#task-input', 'Tentativa de cancel');
    await page.click('#cancel-edit');
    await expect(page.locator('.task-text')).toHaveText(['Tarefa editada']);

    // Deixar campo vazio ao salvar não deve aplicar alteração
    await page.locator('.edit-btn').click();
    await page.fill('#task-input', '   ');
    await page.click('#submit-button');
    await expect(page.locator('.task-text')).toHaveText(['Tarefa editada']);
  });

  test('Editar tarefa concluída mantém status e permite edição', async ({ page }) => {
    await page.fill('#task-input', 'Tarefa concluida');
    await page.click('#submit-button');

    // marcar concluída
    await page.locator('input[type="checkbox"]').check();
    await expect(page.locator('.task-item')).toHaveClass(/completed/);

    // editar
    await page.locator('.edit-btn').click();
    await page.fill('#task-input', 'Tarefa concluida editada');
    await page.click('#submit-button');
    await expect(page.locator('.task-text')).toHaveText(['Tarefa concluida editada']);
    await expect(page.locator('.task-item')).toHaveClass(/completed/);
  });

  test('Concluir e reabrir tarefa + persistência', async ({ page }) => {
    await page.fill('#task-input', 'Persistir teste');
    await page.click('#submit-button');

    await page.locator('input[type="checkbox"]').check();
    await expect(page.locator('.task-item')).toHaveClass(/completed/);

    await page.reload();
    // Após reload, tarefas vêm do localStorage
    await expect(page.locator('.task-text')).toHaveText(['Persistir teste']);
    // reabrir
    await page.locator('input[type="checkbox"]').uncheck();
    await expect(page.locator('.task-item')).not.toHaveClass(/completed/);
  });

  test('Excluir tarefa - confirmar e cancelar', async ({ page }) => {
    await page.fill('#task-input', 'Para excluir');
    await page.click('#submit-button');

    // Cancelar exclusão usando diálogos
    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
    await page.locator('.delete-btn').click();
    await expect(page.locator('.task-item')).toHaveCount(1);

    // Confirmar exclusão
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator('.delete-btn').click();
    await expect(page.locator('.task-item')).toHaveCount(0);
  });
});
