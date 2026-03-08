/**
 * Configuration management
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.kanbanflow-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface Config {
  apiToken?: string;
  baseUrl?: string;
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getApiToken(): string | undefined {
  // Priority: Environment variable > Config file
  const envToken = process.env.KANBANFLOW_API_TOKEN;
  if (envToken) return envToken;

  const config = loadConfig();
  return config.apiToken;
}

export function setApiToken(token: string): void {
  const config = loadConfig();
  config.apiToken = token;
  saveConfig(config);
}
