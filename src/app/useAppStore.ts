import { create } from 'zustand';
import { ensureDefaultMemberCommand } from '@/application/commands/EnsureDefaultMemberCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { logger } from '@/core/logger/logger';

interface AppStore {
  /** 目前成員（P1：預設成員；多成員為 Phase 2）。 */
  memberId: string | null;
  initError: boolean;
  init(): Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  memberId: null,
  initError: false,

  async init() {
    if (get().memberId) return;
    const result = await dispatch(ensureDefaultMemberCommand, {});
    if (result.ok) {
      set({ memberId: result.value });
    } else {
      logger.error('app init failed', { error: result.error.message });
      set({ initError: true });
    }
  },
}));
