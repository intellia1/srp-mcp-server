// Tipos para los hooks de pre-compaction
export interface PreCompactionHook {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  execute: (context: HookExecutionContext) => Promise<HookResult>;
}

export interface HookExecutionContext {
  sessionId: string;
  currentContext: string;
  agentId: string;
  compactableContent: CompactableContent[];
}

export interface CompactableContent {
  id: string;
  type: 'note' | 'task' | 'memory' | 'context';
  content: string;
  priority: 'high' | 'medium' | 'low';
  preserve: boolean;
}

export interface HookResult {
  status: 'success' | 'error' | 'warning';
  preservedContent: CompactableContent[];
  removedContent: CompactableContent[];
  message: string;
}