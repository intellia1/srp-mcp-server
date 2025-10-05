import { PreCompactionHook, HookExecutionContext, HookResult, CompactableContent } from '../types/hook.types';
import Logger from '../utils/logger.js';

export class PreCompactionNotifier implements PreCompactionHook {
  id = 'pre-compaction-notifier';
  name = 'Pre-Compaction Notifier';
  description = 'Notifies the user about content that will be compacted and allows preservation decisions';
  enabled = true;

  async execute(context: HookExecutionContext): Promise<HookResult> {
    Logger.info('Pre-compaction hook executed', { 
      sessionId: context.sessionId, 
      agentId: context.agentId,
      contentCount: context.compactableContent.length 
    });

    try {
      // Identificar contenido con alta prioridad que debe preservarse
      const preservedContent: CompactableContent[] = [];
      const removedContent: CompactableContent[] = [];

      for (const item of context.compactableContent) {
        // En esta implementación básica, preservamos contenido con prioridad alta
        // En una implementación completa, aquí se podría interactuar con el usuario
        if (item.priority === 'high') {
          item.preserve = true;
          preservedContent.push(item);
        } else {
          // Para contenido de prioridad media o baja, se podría preguntar al usuario
          // Por simplicidad en esta implementación, no se preserva
          item.preserve = false;
          removedContent.push(item);
        }
      }

      Logger.info('Pre-compaction evaluation completed', {
        preservedCount: preservedContent.length,
        removedCount: removedContent.length
      });

      return {
        status: 'success',
        preservedContent,
        removedContent,
        message: `Pre-compaction analysis completed. Preserved ${preservedContent.length} high-priority items, ${removedContent.length} items will be compacted.`
      };
    } catch (error) {
      Logger.error('Error in pre-compaction hook', { error });
      
      return {
        status: 'error',
        preservedContent: [],
        removedContent: [],
        message: `Error during pre-compaction analysis: ${error.message}`
      };
    }
  }
}

export default PreCompactionNotifier;