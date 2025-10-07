import * as Ably from 'ably';

const ablyApiKey = import.meta.env.VITE_ABLY_API_KEY;

if (!ablyApiKey) {
  throw new Error('Missing Ably API key. Please add VITE_ABLY_API_KEY to your .env file');
}

export const ably = new Ably.Realtime({
  key: ablyApiKey,
  echoMessages: false,
});

export type AblyMessage = {
  type: 'new_message' | 'delete_message' | 'update_conversation';
  data: any;
};
