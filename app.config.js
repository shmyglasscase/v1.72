import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    ablyApiKey: process.env.VITE_ABLY_API_KEY,
    ebayClientId: process.env.EBAY_CLIENT_ID,
    ebayClientSecret: process.env.EBAY_CLIENT_SECRET,
    ebayRuName: process.env.EBAY_RU_NAME,
    ebayDevId: process.env.EBAY_DEV_ID,
    ebayRedirectUri: process.env.EBAY_REDIRECT_URI,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-project-id-here'
    }
  }
});
