// Common TypeScript types for Platform & API Gateway

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  avatar_url?: string;
  balance: number; // single unified balance across all apps (platform, chat, api)
  currency: 'USD' | 'BDT'; // current active currency
  balance_usd?: number; // helper compatibility
  balance_bdt?: number; // helper compatibility
  granted_usd?: number;
  role?: string;
  created_at: string;
  status?: 'active' | 'restricted' | 'suspended' | 'banned';
  restricted_until?: string | null;
  restriction_reason?: string | null;
  allowed_apps?: string[]; // e.g. ['platform', 'chat', 'api'] for multi-app / chat.fobign.com SSO
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

// Backwards compatibility alias
export type FobignUser = User;

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'superadmin' | 'admin' | 'support_agent' | 'billing_manager' | 'viewer';
  created_at: string;
}

export type FobignAdminUser = AdminUser;

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_preview: string;
  raw_key?: string; // only returned once upon creation
  tracking_id: string;
  rpm_limit: number;
  tpm_limit: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface ProviderDefinition {
  id: string; // e.g., 'prov_gemini', 'prov_openai', 'prov_anthropic', 'prov_groq', 'prov_custom'
  name: string;
  type: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'custom';
  base_url: string;
  api_key?: string;
  is_active: boolean;
  created_at: string;
}

export interface ModelDefinition {
  id: string; // e.g., 'deepseek-chat', 'deepseek-reasoner', 'gpt-4o', 'claude-3-5-sonnet'
  display_name: string;
  provider_id?: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'custom';
  upstream_model: string;
  cost_per_1k_input: number; // in USD
  cost_per_1k_output: number; // in USD
  cost_bdt_per_1k_input?: number; // in BDT
  cost_bdt_per_1k_output?: number; // in BDT
  description: string;
  context_window: number;
  is_enabled: boolean;
  supports_streaming: boolean;
  supports_tools: boolean;
  system_prompt?: string;
  status?: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  api_key_id: string;
  model_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_cost: number;
  created_at: string;
}

export interface Billing {
  id: string;
  invoice_no: string;
  trx_id?: string;
  user_id: string;
  amount: number;
  currency: 'USD' | 'BDT';
  payment_method: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  type: 'topped-up' | 'granted';
  created_at: string;
  billing_address?: {
    full_name?: string;
    address_line1?: string;
    address_line2?: string;
    city_province_postal?: string;
    country_region?: string;
  };
}

export interface BillingInvoice extends Billing {}


export interface PlatformBranding {
  platform_name: string;
  custom_logo_url: string | null;
  favicon_url?: string | null;
  pwa_icon_url?: string | null;
  font_family?: string;
  accent_color: string;
}

// Settings Schemas
export interface ExchangeRateSettings {
  api_key: string;
  base_currency: string;
  target_currency: string;
  rate: number; // e.g., 122.50
  auto_refresh: boolean;
  last_updated: string;
  source: string;
}

export interface BusinessDetails {
  street_address: string;
  city: string;
  zip_code: string;
  country: string;
}

export interface ContactSocialDetails {
  support_phone: string;
  support_email: string;
  support_website: string;
  facebook: string;
  messenger: string;
  whatsapp: string;
  telegram: string;
  youtube: string;
}

export interface GeneralSettings {
  platform_name: string;
  platform_description: string;
  maintenance_mode: boolean;
  support_email: string;
  allow_signups: boolean;
  default_credits: number;
  business?: BusinessDetails;
  contact_social?: ContactSocialDetails;
}

export interface AuthSettings {
  email_auth_enabled: boolean;
  email_verification_required: boolean;
  phone_auth_enabled: boolean;
  google_auth_enabled: boolean;
  google_client_id: string;
  google_client_secret: string;
  github_auth_enabled: boolean;
  github_client_id: string;
  github_client_secret: string;
  supabase_callback_url: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  link_text: string;
  link_url: string;
  bg_color: string;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'usd' | 'bdt' | 'both';
  enabled: boolean;
  fee_percent: number;
  instructions?: string;
  logo_url?: string;
  api_key?: string;
  base_url?: string;
  return_type?: 'GET' | 'POST';
  currency?: string;
}

export interface TaxSettings {
  enabled: boolean;
  rate_percent: number;
  tax_name: string;
  tax_id_number: string;
  collect_on_topup: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
}

export interface SupportTicketReply {
  id: string;
  sender: string;
  sender_type: 'user' | 'agent';
  message: string;
  is_staff?: boolean;
  author?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_no: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  subject: string;
  message: string;
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed' | 'Answered' | 'Customer-Reply' | string;
  priority: 'Low' | 'Medium' | 'High';
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
  replies: SupportTicketReply[];
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: 'BALANCE_ADJUSTMENT' | 'ROLE_CHANGE' | 'USER_STATUS_CHANGE' | 'PROVIDER_UPDATE' | 'MODEL_UPDATE' | 'SETTING_CHANGE' | 'KEY_REVOCATION' | string;
  category: 'Financial' | 'Security' | 'Roles' | 'Access' | 'System';
  target_resource?: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

// OpenAI API Standard Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  name?: string;
  tool_call_id?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  tool_choice?: any;
  user?: string;
}

export interface ChatCompletionResponseChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string | null;
    reasoning_content?: string | null;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatCompletionResponseChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  system_fingerprint?: string;
}

// Anthropic API Standard Types
export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image'; text?: string; source?: any }>;
}

export interface AnthropicMessagesRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string | Array<{ type: 'text'; text: string }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  stop_sequences?: string[];
}

export interface EncryptedCommunicationLog {
  id: string;
  user_id: string;
  user_email?: string;
  endpoint: string;
  model: string;
  encrypted_prompt: string;
  encrypted_response: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status_code: number;
  client_ip?: string;
  created_at: string;
}

export interface PlatformUpdate {
  id: string;
  title: string;
  description: string;
  category: string;
  version?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SecuritySettings {
  email_verification: boolean;
  captcha_protection: 'always' | 'unauthenticated' | 'disabled';
  captcha_type: 'cloudflare';
  cloudflare_site_key?: string;
  cloudflare_secret_key?: string;
  captcha_forms: {
    client_registration: boolean;
    contact_form: boolean;
    ticket_submission: boolean;
    login_forms: boolean;
  };
  csrf_tokens: 'enabled' | 'disabled';
}

export interface CreditSettings {
  enabled: boolean;
  min_deposit: number;
  max_deposit: number;
  max_balance: number;
}

export interface MailSettings {
  active_provider?: string;
  provider?: string;
  sender_email?: string;
  sender_name?: string;
  api_key?: string;
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    from_email?: string;
    from_name?: string;
  };
  resend?: {
    api_key?: string;
    from_email?: string;
    from_name?: string;
  };
  sendgrid?: {
    api_key?: string;
    from_email?: string;
  };
  mailgun?: {
    api_key?: string;
    domain?: string;
    from_email?: string;
  };
}

export interface MailLog {
  id: string;
  to: string;
  subject: string;
  body?: string;
  provider: string;
  status: 'sent' | 'failed' | 'pending';
  response_id?: string;
  error?: string;
  created_at: string;
}

export interface SmsSettings {
  provider: 'twilio' | 'infobip' | 'vonage';
  sender_id: string;
  account_sid?: string;
  auth_token?: string;
  api_key?: string;
}

export interface SmsLog {
  id: string;
  to: string;
  message: string;
  provider: string;
  status: 'sent' | 'failed';
  created_at: string;
}

export interface ChatSettings {
  enabled: boolean;
  allowedModels: string[];
  defaultModel: string;
  freeTokenLimit: number;
  resetHours: number;
  systemPrompt: string;
  enableThinking: boolean;
  allowGuest: boolean;
  greetingMessage: string;
  rateLimitPerMinute: number;
  maxOutputTokens: number;
}



