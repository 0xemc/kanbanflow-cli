/**
 * Tests for configuration utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig, saveConfig, getApiToken, setApiToken, ensureConfigDir } from '../../src/utils/config';

const CONFIG_DIR = path.join(os.homedir(), '.kanbanflow-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

describe('Configuration Utils', () => {
  const originalEnv = process.env.KANBANFLOW_API_TOKEN;

  beforeEach(() => {
    // Clean up config file if it exists
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
    if (fs.existsSync(CONFIG_DIR)) {
      fs.rmdirSync(CONFIG_DIR);
    }
    delete process.env.KANBANFLOW_API_TOKEN;
  });

  afterEach(() => {
    // Restore environment
    if (originalEnv) {
      process.env.KANBANFLOW_API_TOKEN = originalEnv;
    } else {
      delete process.env.KANBANFLOW_API_TOKEN;
    }

    // Clean up
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
    if (fs.existsSync(CONFIG_DIR)) {
      fs.rmdirSync(CONFIG_DIR);
    }
  });

  describe('ensureConfigDir', () => {
    it('should create config directory if it does not exist', () => {
      expect(fs.existsSync(CONFIG_DIR)).toBe(false);

      ensureConfigDir();

      expect(fs.existsSync(CONFIG_DIR)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      ensureConfigDir();
      expect(() => ensureConfigDir()).not.toThrow();
    });
  });

  describe('loadConfig', () => {
    it('should return empty object if config file does not exist', () => {
      const config = loadConfig();

      expect(config).toEqual({});
    });

    it('should load existing config file', () => {
      ensureConfigDir();
      const testConfig = { apiToken: 'test-token', baseUrl: 'https://test.com' };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig));

      const config = loadConfig();

      expect(config).toEqual(testConfig);
    });

    it('should return empty object on invalid JSON', () => {
      ensureConfigDir();
      fs.writeFileSync(CONFIG_FILE, 'invalid json');

      const config = loadConfig();

      expect(config).toEqual({});
    });
  });

  describe('saveConfig', () => {
    it('should save config to file', () => {
      const testConfig = { apiToken: 'test-token', baseUrl: 'https://test.com' };

      saveConfig(testConfig);

      expect(fs.existsSync(CONFIG_FILE)).toBe(true);

      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      expect(saved).toEqual(testConfig);
    });

    it('should create directory if it does not exist', () => {
      expect(fs.existsSync(CONFIG_DIR)).toBe(false);

      saveConfig({ apiToken: 'test' });

      expect(fs.existsSync(CONFIG_DIR)).toBe(true);
      expect(fs.existsSync(CONFIG_FILE)).toBe(true);
    });

    it('should overwrite existing config', () => {
      saveConfig({ apiToken: 'old-token' });
      saveConfig({ apiToken: 'new-token' });

      const config = loadConfig();
      expect(config.apiToken).toBe('new-token');
    });

    it('should format JSON with indentation', () => {
      saveConfig({ apiToken: 'test-token' });

      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      expect(content).toContain('\n');
      expect(content).toContain('  ');
    });
  });

  describe('getApiToken', () => {
    it('should return undefined if no token is configured', () => {
      const token = getApiToken();

      expect(token).toBeUndefined();
    });

    it('should return token from config file', () => {
      saveConfig({ apiToken: 'file-token' });

      const token = getApiToken();

      expect(token).toBe('file-token');
    });

    it('should prioritize environment variable over config file', () => {
      saveConfig({ apiToken: 'file-token' });
      process.env.KANBANFLOW_API_TOKEN = 'env-token';

      const token = getApiToken();

      expect(token).toBe('env-token');
    });

    it('should return environment variable when no config file', () => {
      process.env.KANBANFLOW_API_TOKEN = 'env-token';

      const token = getApiToken();

      expect(token).toBe('env-token');
    });
  });

  describe('setApiToken', () => {
    it('should save token to config file', () => {
      setApiToken('new-token');

      const config = loadConfig();
      expect(config.apiToken).toBe('new-token');
    });

    it('should preserve other config values', () => {
      saveConfig({ apiToken: 'old-token', baseUrl: 'https://test.com' });

      setApiToken('new-token');

      const config = loadConfig();
      expect(config.apiToken).toBe('new-token');
      expect(config.baseUrl).toBe('https://test.com');
    });

    it('should create config file if it does not exist', () => {
      expect(fs.existsSync(CONFIG_FILE)).toBe(false);

      setApiToken('test-token');

      expect(fs.existsSync(CONFIG_FILE)).toBe(true);
    });
  });
});
