/**
 * Theme Generator Script
 * ----------------------
 * Responsible for injecting the correct `theme.css` based on the environment.
 *
 * Logic:
 * 1. Checks `APP_THEME_MODULE` env var.
 * 2. If set, copies `modules/{name}/theme.css` to `src/styles/theme.css`.
 * 3. Else, copies `src/styles/theme.default.css` to `src/styles/theme.css`.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_STYLES_DIR = path.join(ROOT_DIR, 'src/styles');

const TARGET_THEME_PATH = path.join(ROOT_DIR, 'src/styles/theme.css');

/**
 * Dynamically aggregates themes from:
 * 1. Default core themes (light/dark)
 * 2. Any active module that exports a `theme.css`
 */
function generateTheme() {
  console.info('🎨 Generating Dynamic Theme System (Import Strategy)...');

  // 1. Check Base Theme existence
  const baseThemePath = path.join(SRC_STYLES_DIR, 'theme.base.css');
  if (!fs.existsSync(baseThemePath)) {
    console.error('❌ Critical Error: theme.base.css not found!');
    process.exit(1);
  }

  // Start with base import
  let finalContent = '/* 🎨 AUTO-GENERATED - DO NOT EDIT MANUALLY */\n';
  finalContent +=
    '/* This file uses CSS imports to ensure Vite HMR works correctly for module development. */\n\n';
  finalContent += '@import "./theme.base.css";\n';

  // 2. Append App Identity Theme if selected
  const themeModule = process.env.APP_THEME_MODULE;

  if (themeModule) {
    const moduleThemePath = path.join(ROOT_DIR, 'modules', themeModule, 'theme.css');
    if (fs.existsSync(moduleThemePath)) {
      console.info(`✅ Linking App Theme Module: ${themeModule}`);

      // Calculate relative path from src/styles/theme.css to modules/{name}/theme.css
      // src/styles is 2 levels deep from root.
      const relativePath = `../../modules/${themeModule}/theme.css`;
      finalContent += `@import "${relativePath}";\n`;
    } else {
      console.warn(`⚠️ Theme module '${themeModule}' specified but 'theme.css' not found.`);
    }
  } else {
    console.info('ℹ️ Using Default Base Theme only.');
  }

  // 3. Write Final File
  fs.writeFileSync(TARGET_THEME_PATH, finalContent);
  console.info(`✨ Generated theme.css with imports for: ${themeModule || 'Default'}`);
}

generateTheme();
