import * as Ably from 'ably';
import Constants from 'expo-constants';

const ablyApiKey = Constants.expoConfig?.extra?.ablyApiKey;

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
