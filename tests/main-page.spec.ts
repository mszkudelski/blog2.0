import { test, expect } from '@playwright/test';

test.describe('Main Page E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4321');
    });

    test('main page has expected title and content', async ({ page }) => {
        await expect(page).toHaveTitle(/Programuję i Dzielę się Wiedzą – Portfolio i Blog | Marek Szkudelski/);

        const heading = page.locator('h4');
        await expect(heading).toHaveText(/Hej/);

        const blogSection = page.locator('section:has-text("Najnowsze wpisy")');
        await expect(blogSection).toBeVisible();
    });

    test('navigation links work correctly', async ({ page }) => {
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        // Test all main navigation links
        const links = nav.locator('a');
        const count = await links.count();
        expect(count).toBeGreaterThan(0);

        // Verify each link has href and text
        for (let i = 0; i < count; i++) {
            const link = links.nth(i);
            await expect(link).toHaveAttribute('href');
            await expect(link).not.toHaveText('');
        }
    });

    test('latest blog posts section displays correctly', async ({ page }) => {
        const blogSection = page.locator('section:has-text("Najnowsze wpisy")');
        await expect(blogSection).toBeVisible();

        // Check if blog posts are present
        const posts = blogSection.locator('a');
        const postsCount = await posts.count();
        expect(postsCount).toBeGreaterThan(0);

        // Test first post click
        const firstPost = posts.first();
        const firstPostLink = firstPost.locator('a').first();
        const href = await firstPostLink.getAttribute('href');
        await firstPostLink.click();
        await expect(page).toHaveURL(new RegExp(href as string));
    });

    test('contact section has required elements', async ({ page }) => {
        const contactSection = page.locator('section:has-text("Kontakt")');
        await expect(contactSection).toBeVisible();

        // Check social media links
        const socialLinks = contactSection.locator('a[href*="linkedin"], a[href*="github"]');
        await expect(socialLinks).toHaveCount(2);

        // Verify contact form if present
        const form = contactSection.locator('form');
        if (await form.count() > 0) {
            await expect(form.locator('input[type="email"]')).toBeVisible();
            await expect(form.locator('textarea')).toBeVisible();
            await expect(form.locator('button[type="submit"]')).toBeVisible();
        }
    });
});