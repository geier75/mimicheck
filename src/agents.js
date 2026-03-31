// Minimal stub for agent SDK to satisfy imports during development
// Provides no real backend functionality; logs actions to the console.

export const agentSDK = {
  async createConversation({ agent_name, metadata } = {}) {
    console.warn('[agentSDK] createConversation (stub)', { agent_name, metadata });
    const id = 'conv_stub_' + Math.random().toString(36).slice(2);
    return { id, messages: [] };
  },

  subscribeToConversation(conversationId, onUpdate) {
    console.warn('[agentSDK] subscribeToConversation (stub)', { conversationId });
    // No real-time updates in stub. Return unsubscribe fn.
    return () => {};
  },

  async addMessage(conversation, message) {
    console.warn('[agentSDK] addMessage (stub)', { conversation, message });
    // Optionally, fake a bot echo after short delay
    try {
      if (typeof onUpdate === 'function') {
        setTimeout(() => onUpdate?.({ messages: [message] }), 0);
      }
    } catch (_) {}
    return { status: 'ok' };
  },
};
