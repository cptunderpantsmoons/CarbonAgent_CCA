/**
 * Configuration management for Praxis Platform
 */

export interface PraxisConfig {
  port: number;
  agentZeroUrl: string;
  insforgeMcp: {
    url: string;
    token: string;
  };
  agentmail: {
    apiKey: string;
    inbox: string;
    websocketUrl: string;
    apiUrl: string;
  };
  aspect: {
    apiKey: string;
    apiUrl: string;
  };
  xero?: {
    apiKey: string;
    apiUrl: string;
  };
  monday?: {
    apiKey: string;
    apiUrl: string;
    exceptionsBoardId: string;
  };
  planful?: {
    apiKey: string;
    apiUrl: string;
  };
  container: {
    runtime: string;
    image: string;
    memoryLimit: string;
    cpuLimit: string;
  };
  logging: {
    level: string;
    format: string;
  };
}

export function validateConfig(config: Partial<PraxisConfig>): config is PraxisConfig {
  return !!(
    config.port &&
    config.agentZeroUrl &&
    config.insforgeMcp?.url &&
    config.insforgeMcp?.token &&
    config.agentmail?.apiKey &&
    config.agentmail?.inbox &&
    config.aspect?.apiKey &&
    config.container
  );
}
