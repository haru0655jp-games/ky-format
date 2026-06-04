/**
 * ky-parser.js
 * KY Format Reference Implementation (JavaScript / Node.js)
 * https://github.com/yourname/ky-format
 *
 * Requirements: Node.js 18+
 * Dependencies: none (uses built-in modules only)
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// ── Polyfill for environments without native zip support ──────────────────────
// In production, replace this with a zip library (e.g. adm-zip, jszip).
// For this reference implementation, we treat an extracted directory
// as a stand-in for a real .kyfile / .kypack ZIP archive.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a character JSON object against its .kytext schema.
 *
 * @param {object} data   - Parsed character JSON
 * @param {object} schema - Parsed .kytext schema
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAgainstSchema(data, schema) {
  const errors = [];
  const fields = schema.fields ?? {};

  for (const [key, def] of Object.entries(fields)) {
    const value = data[key];

    // Required check
    if (def.required && (value === undefined || value === null)) {
      errors.push(`Missing required field: "${key}"`);
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type check
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (def.type && actualType !== def.type) {
      errors.push(
        `Field "${key}" expected type "${def.type}", got "${actualType}"`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Loads and parses a .kypack directory (or extracted ZIP).
 *
 * @param {string} packPath - Path to the .kypack directory
 * @returns {Promise<{ data: object, schema: object, valid: boolean, errors: string[] }>}
 */
export async function loadKypack(packPath) {
  const files = fs.readdirSync(packPath);

  const jsonFile   = files.find(f => f.endsWith('.json'));
  const schemaFile = files.find(f => f.endsWith('.kytext'));

  if (!jsonFile)   throw new Error(`No .json found in ${packPath}`);
  if (!schemaFile) throw new Error(`No .kytext found in ${packPath}`);

  const data   = JSON.parse(fs.readFileSync(path.join(packPath, jsonFile),   'utf-8'));
  const schema = JSON.parse(fs.readFileSync(path.join(packPath, schemaFile), 'utf-8'));

  const { valid, errors } = validateAgainstSchema(data, schema);

  return { data, schema, valid, errors };
}

/**
 * Loads and parses a .kydata file.
 *
 * @param {string} kydataPath - Path to the .kydata file
 * @returns {object} Parsed .kydata object
 */
export function loadKydata(kydataPath) {
  if (!fs.existsSync(kydataPath)) {
    throw new Error(`.kydata not found at: ${kydataPath}`);
  }
  return JSON.parse(fs.readFileSync(kydataPath, 'utf-8'));
}

/**
 * Loads and parses a .kap plugin file.
 *
 * @param {string} kapPath - Path to the .kap file
 * @returns {object} Parsed .kap object
 */
export function loadKap(kapPath) {
  if (!fs.existsSync(kapPath)) {
    throw new Error(`.kap not found at: ${kapPath}`);
  }
  return JSON.parse(fs.readFileSync(kapPath, 'utf-8'));
}

/**
 * KyFile — main class for loading a .kyfile (or extracted directory).
 *
 * Usage:
 *   const app = await KyFile.load('./myapp.kyfile');
 *   const aria = await app.getCharacter('aria');
 */
export class KyFile {
  #rootPath;
  #kydata;

  constructor(rootPath, kydata) {
    this.#rootPath = rootPath;
    this.#kydata   = kydata;
  }

  /**
   * Load a .kyfile archive or extracted directory.
   *
   * @param {string} filePath - Path to .kyfile or extracted directory
   * @returns {Promise<KyFile>}
   */
  static async load(filePath) {
    // NOTE: In production, extract the ZIP here.
    // This reference implementation treats the path as an extracted directory.
    const kydataPath = path.join(filePath, '.kydata');
    const kydata     = loadKydata(kydataPath);
    return new KyFile(filePath, kydata);
  }

  /** App metadata from .kydata */
  get app() {
    return this.#kydata.app;
  }

  /** List of declared packages */
  get packages() {
    return this.#kydata.packages ?? [];
  }

  /** List of declared plugins */
  get plugins() {
    return this.#kydata.plugins ?? [];
  }

  /**
   * Load a character by ID.
   *
   * @param {string} characterId - The character ID (matches .kypack name)
   * @returns {Promise<{ data: object, schema: object, valid: boolean, errors: string[] }>}
   */
  async getCharacter(characterId) {
    const pkg = this.packages.find(p => p.name === characterId);
    if (!pkg) throw new Error(`Character "${characterId}" not found in .kydata`);

    const packPath = path.join(this.#rootPath, pkg.file);
    return loadKypack(packPath);
  }

  /**
   * Load all characters declared in .kydata.
   *
   * @returns {Promise<Map<string, object>>}
   */
  async getAllCharacters() {
    const result = new Map();
    for (const pkg of this.packages) {
      const character = await this.getCharacter(pkg.name);
      result.set(pkg.name, character);
    }
    return result;
  }

  /**
   * Load a plugin by name.
   *
   * @param {string} pluginName - The plugin name
   * @returns {object} Parsed .kap object
   */
  getPlugin(pluginName) {
    const plugin = this.plugins.find(p => p.name === pluginName);
    if (!plugin) throw new Error(`Plugin "${pluginName}" not found in .kydata`);

    const kapPath = path.join(this.#rootPath, plugin.file);
    return loadKap(kapPath);
  }
}

// ── CLI quick-check ───────────────────────────────────────────────────────────
// Run: node src/ky-parser.js ./examples/myapp.kyfile
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node ky-parser.js <path-to-.kyfile>');
    process.exit(1);
  }

  try {
    const app = await KyFile.load(target);
    console.log('✅ App loaded:', app.app.name, 'v' + app.app.version);

    const characters = await app.getAllCharacters();
    for (const [id, { data, valid, errors }] of characters) {
      const status = valid ? '✅' : '❌';
      console.log(`${status} Character [${id}]: ${data.name}`);
      if (!valid) errors.forEach(e => console.log('   ⚠', e));
    }

    for (const plugin of app.plugins) {
      const kap = app.getPlugin(plugin.name);
      console.log(`🔌 Plugin: ${kap.name} v${kap.version} (type: ${kap.type})`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}
