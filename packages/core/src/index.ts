export interface PluginContext {
  projectRoot: string;
  projectName: string;
  isTs: boolean;
  language: 'ts' | 'js';
}

export interface PluginAction {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  files?: {
    path: string; // relative to src
    content: string;
  }[];
  scripts?: Record<string, string>;
  env?: Record<string, string>;
  commands?: string[];
}

export interface Plugin {
  name: string;
  apply: (context: PluginContext, options?: any) => Promise<PluginAction>;
}
