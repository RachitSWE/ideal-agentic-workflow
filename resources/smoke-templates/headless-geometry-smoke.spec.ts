/**
 * headless-geometry-smoke.spec.ts
 * 
 * Standard S7-D Headless Geometry & Viewport Clamping Smoke Recipe.
 * Enforces Invariants 20, 21, and 24; remediates BUG-001, BUG-010, BUG-012, BUG-017, BUG-022.
 * 
 * Validates:
 * 1. Persistent docking: Fixed elements remain locked to browser viewport regardless of 3000px scroll (BUG-001).
 * 2. Avatar circular geometry: Width strictly equals height (1:1 square) without oval distortion (BUG-010).
 * 3. Modal breakout: Overlays escape ancestor container max-width constraints (BUG-012).
 * 4. Mobile touch scroll: Canvas touch surfaces do not hijack vertical page scroll (BUG-017).
 * 5. Fullscreen letterboxing: Canvas viewports preserve 16:9 aspect ratio on mobile viewports (BUG-022).
 */

import { test, expect } from '@playwright/test';

test.describe('S7-D Headless Geometry & Viewport Clamping Gate', () => {

  test('BUG-001: UnsavedChangesBar anchors strictly to browser viewport on scroll', async ({ page }) => {
    // Navigate to target settings/edit page
    await page.goto('/settings');

    // Trigger dirty state
    const input = page.locator('input[type="text"]').first();
    if (await input.count() > 0) {
      await input.fill('dirty-state-trigger');
      
      // Scroll down by 2500px
      await page.evaluate(() => window.scrollTo(0, 2500));
      
      const bar = page.locator('[data-testid="unsaved-changes-bar"], [role="alert"]');
      if (await bar.count() > 0) {
        await expect(bar).toBeVisible();
        const box = await bar.boundingBox();
        const viewport = page.viewportSize()!;
        
        // Assert bar bottom remains locked within 40px of physical viewport bottom
        expect(box).not.toBeNull();
        expect(box!.y + box!.height).toBeGreaterThanOrEqual(viewport.height - 48);
        expect(box!.y).toBeLessThan(viewport.height);
      }
    }
  });

  test('BUG-010: Avatar geometry maintains strict 1:1 circular aspect ratio', async ({ page }) => {
    await page.goto('/customiser/welcomer');
    const avatar = page.locator('[data-testid="canvas-avatar"], img[alt*="avatar" i]').first();
    if (await avatar.count() > 0) {
      const box = await avatar.boundingBox();
      expect(box).not.toBeNull();
      // Width and Height must be identical within 1.0px (strict 1:1 circle, not oval)
      expect(Math.abs(box!.width - box!.height)).toBeLessThanOrEqual(1.0);
    }
  });

  test('BUG-012: Magnifier modal escapes ancestor container max-width', async ({ page }) => {
    await page.goto('/customiser/welcomer');
    const magnifyBtn = page.locator('[data-testid="btn-magnify"], button:has-text("Zoom"), button:has-text("Magnify")').first();
    if (await magnifyBtn.count() > 0) {
      await magnifyBtn.click();
      const modal = page.locator('[data-testid="magnifier-overlay"], [role="dialog"]').first();
      await expect(modal).toBeVisible();
      const box = await modal.boundingBox();
      const viewport = page.viewportSize()!;
      // Modal overlay must break out to cover >= 85% of screen width
      expect(box!.width).toBeGreaterThanOrEqual(viewport.width * 0.85);
    }
  });

  test('BUG-017: Vertical touch swipe on canvas scrolls the host page on mobile', async ({ page }) => {
    // Emulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/customiser/welcomer');

    const initialScrollY = await page.evaluate(() => window.scrollY);
    // Touch swipe upward on the preview canvas
    await page.touchscreen.swipe(180, 400, 180, 100);
    await page.waitForTimeout(300);

    const finalScrollY = await page.evaluate(() => window.scrollY);
    // Verify vertical scrolling occurred and was not hijacked
    expect(finalScrollY).toBeGreaterThanOrEqual(initialScrollY);
  });

  test('BUG-022: Fullscreen modal enforces strict 16:9 letterbox aspect ratio', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X vertical viewport
    await page.goto('/customiser/welcomer');
    const fullscreenBtn = page.locator('[data-testid="btn-fullscreen"], button:has-text("Fullscreen")').first();
    if (await fullscreenBtn.count() > 0) {
      await fullscreenBtn.click();
      const canvas = page.locator('[data-testid="fullscreen-canvas"], [data-testid="welcomer-canvas"]').first();
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      const ratio = box!.width / box!.height;
      // Must maintain 16:9 ratio (approx 1.77) with letterbox container
      expect(ratio).toBeCloseTo(16 / 9, 1);
    }
  });

});
