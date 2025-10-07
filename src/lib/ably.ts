import * as Ably from 'ably';

const ablyApiKey = import.meta.env.VITE_ABLY_API_KEY;

if (!ablyApiKey) {
  console.warn('Missing Ably API key. Real-time messaging features will be disabled.');
}

export const ably = ablyApiKey ? new Ably.Realtime({
  key: ablyApiKey,
  echoMessages: false,
}) : null;

export type AblyMessage = {
  type: 'new_message' | 'delete_message' | 'update_conversation';
  data: any;
};
