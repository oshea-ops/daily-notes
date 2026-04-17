import { test, expect } from '@playwright/test';

test.describe('Daily Notes QA Test Suites', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate and clear local storage to ensure clean state
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test.describe('Suite 1: Core Note Management', () => {
    test('Create a basic text note and pin it', async ({ page }) => {
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('input[placeholder="Title"]').fill('QA Test Note');
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').fill('This is a basic test note.');
      await page.getByRole('button', { name: 'Close' }).click();

      // Verify creation
      const title = page.getByText('QA Test Note');
      await expect(title).toBeVisible();

      // Pin the note
      const noteCard = page.locator('div[class*="NoteCard_card"]').first();
      await noteCard.hover();
      await noteCard.locator('button[class*="pinButton"]').click();

      // Verify pinned section exists
      const pinnedHeader = page.getByText('Pinned');
      await expect(pinnedHeader).toBeVisible();
    });

    test('Color Coding visibility', async ({ page }) => {
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('input[placeholder="Title"]').fill('Color Note');
      await page.getByRole('button', { name: 'Close' }).click();

      const noteCard = page.locator('div[class*="NoteCard_card"]').first();
      await noteCard.hover();
      
      // Click palette
      await noteCard.locator('button').filter({ has: page.locator('svg.lucide-palette') }).click();
      // Click a color
      await noteCard.locator('div[class*="colorOption"]').nth(2).click();

      // Check style update
      const style = await noteCard.getAttribute('style');
      expect(style).toContain('background-color:');
    });
  });

  test.describe('Suite 2: Rich Content & Formatting', () => {
    test('Markdown Rendering', async ({ page }) => {
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').fill('# Header\n**Bold** and *Italic*');
      await page.getByRole('button', { name: 'Close' }).click();

      const noteContent = page.locator('div[class*="NoteCard_content"]').first();
      await expect(noteContent.locator('h1')).toHaveText('Header');
      await expect(noteContent.locator('strong')).toHaveText('Bold');
      await expect(noteContent.locator('em')).toHaveText('Italic');
    });

    test('Hashtags Rendering', async ({ page }) => {
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').fill('Reviewing PRs #urgent #work');
      await page.getByRole('button', { name: 'Close' }).click();

      const badge1 = page.getByText('#urgent');
      const badge2 = page.getByText('#work');
      await expect(badge1).toBeVisible();
      await expect(badge2).toBeVisible();
    });
  });

  test.describe('Suite 4: Organization & Routing', () => {
    test('Custom Notebooks auto-filing', async ({ page }) => {
      // Create Notebook
      await page.locator('button[title="Add Notebook"]').click();
      await page.locator('input[placeholder="Notebook name..."]').fill('TestBook');
      await page.getByRole('button', { name: 'Create' }).click();

      // Navigate to Notebook
      await page.getByText('TestBook').click();

      // Create Note
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('input[placeholder="Title"]').fill('Filed Note');
      await page.getByRole('button', { name: 'Close' }).click();

      // Verify Note is in Notebook
      await expect(page.getByText('Filed Note')).toBeVisible();

      // Go to main feed
      await page.getByText('Notes', { exact: true }).click();
      await expect(page.getByText('Filed Note')).toBeVisible();

      // Verify section badge exists
      await expect(page.locator('div[class*="NoteCard_sectionBadge"]')).toHaveText('TestBook');
    });

    test('Archive and Trash Flow', async ({ page }) => {
      // Create a note
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('input[placeholder="Title"]').fill('Delete Me');
      await page.getByRole('button', { name: 'Close' }).click();

      // Delete it
      const noteCard = page.locator('div[class*="NoteCard_card"]').first();
      await noteCard.hover();
      await noteCard.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).click();

      // Should not be in main feed
      await expect(page.getByText('Delete Me')).toBeHidden();

      // Should be in Trash
      await page.getByText('Trash').click();
      await expect(page.getByText('Delete Me')).toBeVisible();
    });
  });

  test.describe('Suite 5: Alarms & Advanced Logic', () => {
    test('Natural Language Time Alarm', async ({ page }) => {
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').click();
      await page.locator('textarea[placeholder="Take a note... (or use voice)"]').fill('Buy milk tomorrow at 5pm');
      
      // Wait for chrono node parsing to catch up
      await page.waitForTimeout(500);

      // Verify suggestion appears
      await expect(page.getByText(/Suggested Reminder/)).toBeVisible();

      await page.getByRole('button', { name: 'Close' }).click();

      // Verify alarm badge
      const alarmBadge = page.locator('div[class*="NoteCard_alarmBadge"]').first();
      await expect(alarmBadge).toBeVisible();
    });
  });

});
