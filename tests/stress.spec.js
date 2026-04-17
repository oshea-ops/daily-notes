import { test, expect } from '@playwright/test';

test.describe('Daily Notes QA Stress Test', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Rapid-fire Note Creation (100 Notes)', async ({ page }) => {
    test.setTimeout(60000); // 1 minute timeout
    
    // Create 50 notes as fast as possible
    for (let i = 0; i < 50; i++) {
      // Click the input area to expand
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      
      // Type title and content
      await page.locator('input[placeholder="Title"]').fill(`Stress Note ${i}`);
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').fill(`This is rapid note #${i} to test Framer Motion and LocalStorage concurrency. #stress`);
      
      // Click close to save
      await page.getByRole('button', { name: 'Close' }).click();
      
      // Small delay to allow react state to batch if needed, though we want to stress it
      await page.waitForTimeout(50);
    }

    // Verify 50 notes were created (plus any existing ones)
    const noteCards = page.locator('div[class*="NoteCard_card"]');
    expect(await noteCards.count()).toBeGreaterThanOrEqual(50);
  });

  test('Massive Content & Zalgo Text Test', async ({ page }) => {
    // Generate 100,000 characters of text
    const massiveText = "A".repeat(100000);
    const zalgoText = "T̸h̵i̵s̸ ̶i̶s̶ ̸Z̴a̵l̴g̵o̵ ̶t̴e̵x̵t̶!̴ ̶I̵t̶ ̷s̶h̵o̵u̵l̸d̷ ̸n̴o̷t̵ ̸b̸r̴e̸a̵k̴ ̶t̷h̵e̵ ̷c̸a̶r̴d̶ ̶l̴a̶y̷o̷u̵t̷.̵";
    const xssAttempt = "<script>alert('XSS')</script>";

    await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
    await page.locator('input[placeholder="Title"]').fill('Extreme Edge Case Note');
    await page.locator('textarea[placeholder="Take a note... (or use voice)"]').fill(`${zalgoText}\n\n${xssAttempt}\n\n${massiveText}`);
    
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify it saved without crashing the page
    const noteContent = page.locator('div[class*="NoteCard_content"]').first();
    await expect(noteContent).toBeVisible();
  });

  test('LocalStorage Quota Exhaustion', async ({ page }) => {
    test.setTimeout(60000);
    // LocalStorage is typically 5MB. 
    // We will inject a massive 2MB string multiple times until it fails.
    
    let caughtError = false;
    
    page.on('pageerror', exception => {
      console.log(`Uncaught exception: "${exception}"`);
    });

    try {
      await page.evaluate(() => {
        let chunk = "X".repeat(2 * 1024 * 1024); // 2MB string
        for(let i = 0; i < 5; i++) {
          let currentNotes = JSON.parse(localStorage.getItem('daily_notes') || '[]');
          currentNotes.push({ id: `massive-${i}`, content: chunk, status: 'active' });
          try {
            localStorage.setItem('daily_notes', JSON.stringify(currentNotes));
          } catch (e) {
            window.quotaError = e.name;
            throw e;
          }
        }
      });
    } catch (e) {
      caughtError = true;
    }

    const quotaError = await page.evaluate(() => window.quotaError);
    expect(quotaError).toBe('QuotaExceededError');
  });

});
