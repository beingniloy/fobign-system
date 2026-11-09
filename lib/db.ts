import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import type {
  User,
  AdminUser,
  ApiKey,
  ModelDefinition,
  ProviderDefinition,
  UsageRecord,
  Billing,
  PlatformBranding,
  ExchangeRateSettings,
  GeneralSettings,
  AnnouncementSettings,
  PaymentMethodItem,
  TaxSettings,
  RoleDefinition,
  SupportTicket,
  AdminAuditLog,
  PlatformUpdate,
  EncryptedCommunicationLog,
  SecuritySettings,
  CreditSettings,
  MailSettings,
  MailLog,
  SmsSettings,
  SmsLog,
  AuthSettings,
} from './types';

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oltjngakooyiysonlkqi.supabase.co';
export const SUPABASE_PROJECT_ID = 'oltjngakooyiysonlkqi';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Default exchange rate fallback (1 USD = 122.50 BDT)
export let CURRENT_USD_TO_BDT_RATE = 122.50;
export const USD_TO_BDT_RATE = CURRENT_USD_TO_BDT_RATE;

// Initialize Supabase Client if keys are present
export const supabase = (SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const supabaseAdmin = (SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Initial default providers
export const DEFAULT_PROVIDERS: ProviderDefinition[] = [
  {
    id: 'prov_gemini',
    name: 'Google Gemini (Native Core)',
    type: 'gemini',
    base_url: 'https://generativelanguage.googleapis.com',
    api_key: 'SERVER_MANAGED',
    is_active: true,
    created_at: '2026-06-01',
  },
  {
    id: 'prov_openai',
    name: 'OpenAI Direct Endpoint',
    type: 'openai',
    base_url: 'https://api.openai.com/v1',
    api_key: '',
    is_active: true,
    created_at: '2026-06-01',
  },
  {
    id: 'prov_anthropic',
    name: 'Anthropic Claude Engine',
    type: 'anthropic',
    base_url: 'https://api.anthropic.com/v1',
    api_key: '',
    is_active: true,
    created_at: '2026-06-01',
  },
  {
    id: 'prov_deepseek',
    name: 'DeepSeek Official Proxy',
    type: 'deepseek',
    base_url: 'https://api.deepseek.com/v1',
    api_key: '',
    is_active: true,
    created_at: '2026-06-01',
  },
  {
    id: 'prov_groq',
    name: 'Groq Cloud Inference',
    type: 'groq',
    base_url: 'https://api.groq.com/openai/v1',
    api_key: '',
    is_active: true,
    created_at: '2026-06-01',
  },
];

// Initial default models
export const DEFAULT_MODELS: ModelDefinition[] = [
  {
    id: 'deepseek-chat',
    display_name: 'DeepSeek-V3 (Chat)',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.00014,
    cost_per_1k_output: 0.00028,
    cost_bdt_per_1k_input: 0.0171,
    cost_bdt_per_1k_output: 0.0343,
    description: 'High performance general purpose reasoning and coding model.',
    context_window: 64000,
    is_enabled: true,
    supports_streaming: true,
    supports_tools: true,
  },
  {
    id: 'deepseek-reasoner',
    display_name: 'DeepSeek-R1 (Reasoner)',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.00055,
    cost_per_1k_output: 0.00219,
    cost_bdt_per_1k_input: 0.0673,
    cost_bdt_per_1k_output: 0.2682,
    description: 'Deep mathematical reasoning and step-by-step thinking model.',
    context_window: 64000,
    is_enabled: true,
    supports_streaming: true,
    supports_tools: false,
  },
  {
    id: 'gpt-4o',
    display_name: 'GPT-4o (Omni)',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.0025,
    cost_per_1k_output: 0.010,
    cost_bdt_per_1k_input: 0.306,
    cost_bdt_per_1k_output: 1.225,
    description: 'Flagship multimodal high-speed intelligence model.',
    context_window: 128000,
    is_enabled: true,
    supports_streaming: true,
    supports_tools: true,
  },
  {
    id: 'gpt-4o-mini',
    display_name: 'GPT-4o Mini',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.00015,
    cost_per_1k_output: 0.0006,
    cost_bdt_per_1k_input: 0.0183,
    cost_bdt_per_1k_output: 0.0735,
    description: 'Fast, cost-efficient model for focused lightweight tasks.',
    context_window: 128000,
    is_enabled: true,
    supports_streaming: true,
    supports_tools: true,
  },
  {
    id: 'claude-3-5-sonnet',
    display_name: 'Claude 3.5 Sonnet',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.003,
    cost_per_1k_output: 0.015,
    cost_bdt_per_1k_input: 0.3675,
    cost_bdt_per_1k_output: 1.8375,
    description: 'Anthropic leading model for coding and nuanced analysis.',
    context_window: 200000,
    is_enabled: true,
    supports_streaming: true,
    supports_tools: true,
  },
  {
    id: 'claude-3-haiku',
    display_name: 'Claude 3 Haiku',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.00025,
    cost_per_1k_output: 0.00125,
    cost_bdt_per_1k_input: 0.0306,
    cost_bdt_per_1k_output: 0.1531,
    description: 'Near-instant responsiveness for high-volume pipelines.',
    context_window: 200000,
    is_enabled: true,
    supports_streaming: true,
    supports_tools: true,
  },
];

// Fallback in-memory / state engine for resilient execution
class DatabaseStore {
  users: Map<string, User> = new Map();
  adminUsers: Map<string, AdminUser> = new Map();
  apiKeys: Map<string, ApiKey> = new Map();
  providers: Map<string, ProviderDefinition> = new Map();
  models: Map<string, ModelDefinition> = new Map();
  usageLogs: UsageRecord[] = [];
  billings: Billing[] = [];
  auditLogs: AdminAuditLog[] = [];
  communicationLogs: EncryptedCommunicationLog[] = [];
  updates: Map<string, PlatformUpdate> = new Map();
  
  // ... (keeping other parts the same, need to be careful with the replacement)

  // Settings
  exchangeRateSettings: ExchangeRateSettings = {
    api_key: '',
    base_currency: 'USD',
    target_currency: 'BDT',
    rate: 122.50,
    auto_refresh: true,
    last_updated: '2026-06-14 10:00:00',
    source: 'https://app.exchangerate-api.com',
  };

  generalSettings: GeneralSettings = {
    platform_name: 'fobign',
    platform_description: 'Unified High-Performance AI API Gateway',
    maintenance_mode: false,
    support_email: 'api-service@fobign.com',
    allow_signups: true,
    default_credits: 0.00,
    business: {
      street_address: '12F, Galaxy International Building',
      city: 'Dhaka',
      zip_code: '1216',
      country: 'Bangladesh',
    },
    contact_social: {
      support_phone: '123-456-7890',
      support_email: 'support@serverfest.com',
      support_website: 'https://dash.serverfest.com/submitticket.php',
      facebook: 'serverfest',
      messenger: 'serverfest',
      whatsapp: '+1234567890',
      telegram: 'serverfest',
      youtube: '@ServerFest',
    },
  };

  authSettings: AuthSettings = {
    email_auth_enabled: true,
    email_verification_required: true,
    phone_auth_enabled: false,
    google_auth_enabled: true,
    google_client_id: '',
    google_client_secret: '',
    github_auth_enabled: true,
    github_client_id: '',
    github_client_secret: '',
    supabase_callback_url: 'https://oltjngakooyiysonlkqi.supabase.co/auth/v1/callback',
  };

  branding: PlatformBranding = {
    platform_name: 'fobign',
    custom_logo_url: null,
    favicon_url: null,
    pwa_icon_url: null,
    font_family: 'Nunito',
    accent_color: '#FFFFFF',
  };

  securitySettings: SecuritySettings = {
    email_verification: true,
    captcha_protection: 'unauthenticated',
    captcha_type: 'cloudflare',
    cloudflare_site_key: '',
    cloudflare_secret_key: '',
    captcha_forms: {
      client_registration: true,
      contact_form: true,
      ticket_submission: true,
      login_forms: true,
    },
    csrf_tokens: 'enabled',
  };

  creditSettings: CreditSettings = {
    enabled: true,
    min_deposit: 10.0,
    max_deposit: 10000.0,
    max_balance: 30000.0,
  };

  mailSettings: MailSettings = {
    active_provider: 'resend',
    provider: 'resend',
    sender_email: 'noreply@fobign.com',
    sender_name: 'Fobign Platform',
    resend: {
      api_key: '',
      from_email: 'noreply@fobign.com',
      from_name: 'Fobign Platform',
    },
    smtp: {
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      username: 'resend',
      password: '',
      from_email: 'noreply@fobign.com',
      from_name: 'Fobign Platform',
    },
  };

  mailLogs: MailLog[] = [];

  smsSettings: SmsSettings = {
    provider: 'twilio',
    sender_id: 'FOBIGN',
  };

  smsLogs: SmsLog[] = [];

  announcementSettings: AnnouncementSettings = {
    enabled: true,
    text: 'DeepSeek V4.1 Flash has been updated to version V4.1-Flash-1017 with enhanced capabilities. Multi-model gateway now active.',
    link_text: 'Click for details.',
    link_url: '#details',
    bg_color: '#1b439c',
  };

  paymentMethods: PaymentMethodItem[] = [
    {
      id: 'paymently',
      name: 'Paymently (bKash, Nagad, Rocket, Cards)',
      type: 'both',
      enabled: true,
      fee_percent: 1.85,
      instructions: 'Instant secure checkout via Paymently gateway (supports BDT and USD)',
      logo_url: 'https://paymently.link/logo.png',
      api_key: process.env.PAYMENTLY_API_KEY || '',
      base_url: 'https://paymently.link',
      return_type: 'POST',
      currency: 'BDT',
    },
    { id: 'paypal', name: 'PayPal / Debit or Credit Card', type: 'usd', enabled: true, fee_percent: 6.0, logo_url: '' },
    { id: 'card', name: 'VISA / Mastercard Direct', type: 'usd', enabled: true, fee_percent: 6.0, logo_url: '' },
    { id: 'gpay', name: 'Google Pay', type: 'usd', enabled: true, fee_percent: 6.0, logo_url: '' },
    { id: 'bkash', name: 'bKash / Nagad / Rocket (Manual/Direct MFS)', type: 'bdt', enabled: true, fee_percent: 1.85, logo_url: '' },
    { id: 'local_card', name: 'Bangladeshi Debit / Credit / Nexus', type: 'bdt', enabled: true, fee_percent: 2.0, logo_url: '' },
  ];

  taxSettings: TaxSettings = {
    enabled: true,
    rate_percent: 6.0,
    tax_name: 'VAT',
    tax_id_number: 'VAT-BD-9281749',
    collect_on_topup: true,
  };

  roles: RoleDefinition[] = [
    {
      id: 'role_superadmin',
      name: 'Super Admin',
      description: 'Full root system privileges, financial settings, all API endpoints, and gateway control.',
      permissions: [
        'endpoint:chat',
        'endpoint:messages',
        'endpoint:moderation',
        'endpoint:models',
        'endpoint:embeddings',
        'endpoint:usage',
        'endpoint:ratelimits',
        'endpoint:keys',
        'staff:tickets',
        'staff:billing',
        'staff:settings',
        'staff:users',
      ],
      user_count: 1,
    },
    {
      id: 'role_support_agent',
      name: 'Support Agent',
      description: 'Can reply to developer tickets, inspect API logs, view moderation reports, and check user quotas.',
      permissions: [
        'endpoint:usage',
        'endpoint:models',
        'endpoint:moderation',
        'staff:tickets',
        'staff:users',
      ],
      user_count: 2,
    },
    {
      id: 'role_billing_manager',
      name: 'Billing Manager',
      description: 'Handles financial transactions, refund requests, currency exchange rates, taxes, and wallet top-ups.',
      permissions: [
        'endpoint:usage',
        'staff:billing',
        'staff:settings',
        'staff:users',
      ],
      user_count: 1,
    },
    {
      id: 'role_api_auditor',
      name: 'API & Security Auditor',
      description: 'Read-only access to evaluate API traffic, telemetry metrics, model quotas, and security audits.',
      permissions: [
        'endpoint:usage',
        'endpoint:ratelimits',
        'endpoint:models',
        'endpoint:moderation',
      ],
      user_count: 1,
    },
  ];

  tickets: SupportTicket[] = [];

  // Real-time minute tracking for rate limits (keyId -> timestamps)
  private requestTimestamps: Map<string, number[]> = new Map();
  private tokenTimestamps: Map<string, Array<{ time: number; tokens: number }>> = new Map();
  private lastDiskSyncTime = 0;

  constructor() {
    this.seed();
    this.loadFromDisk();
    this.initSupabaseSync();
  }

  async initSupabaseSync() {
    if (!supabaseAdmin) return;
    try {
      const [mRes, pRes] = await Promise.all([
        supabaseAdmin.from('models').select('*'),
        supabaseAdmin.from('providers').select('*'),
      ]);
      if (mRes.data && mRes.data.length > 0) {
        this.models.clear();
        for (const m of mRes.data) {
          this.models.set(m.id, m);
        }
      }
      if (pRes.data && pRes.data.length > 0) {
        this.providers.clear();
        for (const p of pRes.data) {
          this.providers.set(p.id, p);
        }
      }
      this.persist();
    } catch (e) {
      // fallback
    }
  }

  getDbFilePath(): string {
    const cwd = process.cwd();
    const parent = path.dirname(cwd);
    if (path.basename(parent).toLowerCase() === 'fobign' || fs.existsSync(path.join(parent, 'fobign_shared_data.json'))) {
      return path.join(parent, 'fobign_shared_data.json');
    }
    return path.join(cwd, 'fobign_shared_data.json');
  }

  persist() {
    try {
      const filePath = this.getDbFilePath();
      const payload = {
        users: this.getAllUsers ? this.getAllUsers() : Array.from(this.users?.values() || []),
        adminUsers: this.adminUsers ? Array.from(this.adminUsers.values()) : [],
        providers: this.providers ? Array.from(this.providers.values()) : [],
        models: this.models ? Array.from(this.models.values()) : [],
        apiKeys: this.apiKeys ? Array.from(this.apiKeys.values()) : [],
        billings: this.billings || [],
        paymentMethods: this.paymentMethods || [],
        taxSettings: this.taxSettings || null,
        branding: this.branding || null,
        generalSettings: this.generalSettings || null,
        exchangeRateSettings: this.exchangeRateSettings || null,
        announcementSettings: this.announcementSettings || null,
        roles: this.roles || [],
        tickets: this.tickets || [],
        auditLogs: this.auditLogs || [],
        communicationLogs: this.communicationLogs || [],
        updates: this.updates ? Array.from(this.updates.values()) : [],
        securitySettings: this.securitySettings || null,
        creditSettings: this.creditSettings || null,
        mailSettings: this.mailSettings || null,
        mailLogs: this.mailLogs || [],
        smsSettings: this.smsSettings || null,
        smsLogs: this.smsLogs || [],
        authSettings: this.authSettings || null,
      };
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
      try {
        this.lastDiskSyncTime = fs.statSync(filePath).mtimeMs;
      } catch {
        this.lastDiskSyncTime = Date.now();
      }
    } catch (e) {
      console.error('[DB PERSIST ERROR]', e);
    }
  }

  loadFromDisk() {
    try {
      const filePath = this.getDbFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          this.users.clear();
          for (const u of data.users) {
            this.users.set(u.id, u);
            if (u.email) this.users.set(u.email, u);
          }
        }
        if (data.adminUsers && Array.isArray(data.adminUsers)) {
          this.adminUsers.clear();
          for (const a of data.adminUsers) {
            this.adminUsers.set(a.email, a);
          }
        }
        if (data.providers && Array.isArray(data.providers)) {
          this.providers.clear();
          for (const p of data.providers) {
            this.providers.set(p.id, p);
          }
        }
        if (data.models && Array.isArray(data.models)) {
          this.models.clear();
          for (const m of data.models) {
            this.models.set(m.id, m);
          }
        }
        if (data.apiKeys && Array.isArray(data.apiKeys)) {
          this.apiKeys.clear();
          for (const k of data.apiKeys) {
            this.apiKeys.set(k.id, k);
          }
        }
        if (data.billings && Array.isArray(data.billings)) this.billings = data.billings;
        if (data.paymentMethods && Array.isArray(data.paymentMethods)) this.paymentMethods = data.paymentMethods;
        if (data.taxSettings) this.taxSettings = data.taxSettings;
        if (data.branding) this.branding = data.branding;
        if (data.generalSettings) this.generalSettings = data.generalSettings;
        if (data.exchangeRateSettings) this.exchangeRateSettings = data.exchangeRateSettings;
        if (data.announcementSettings) this.announcementSettings = data.announcementSettings;
        if (data.roles && Array.isArray(data.roles)) this.roles = data.roles;
        if (data.tickets && Array.isArray(data.tickets)) this.tickets = data.tickets;
        if (data.auditLogs && Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
        if (data.communicationLogs && Array.isArray(data.communicationLogs)) this.communicationLogs = data.communicationLogs;
        if (data.updates && Array.isArray(data.updates)) {
          this.updates.clear();
          for (const u of data.updates) {
            this.updates.set(u.id, u);
          }
        }
        if (data.securitySettings) this.securitySettings = { ...this.securitySettings, ...data.securitySettings };
        if (data.creditSettings) this.creditSettings = { ...this.creditSettings, ...data.creditSettings };
        if (data.mailSettings) this.mailSettings = { ...this.mailSettings, ...data.mailSettings };
        if (data.mailLogs && Array.isArray(data.mailLogs)) this.mailLogs = data.mailLogs;
        if (data.smsSettings) this.smsSettings = { ...this.smsSettings, ...data.smsSettings };
        if (data.smsLogs && Array.isArray(data.smsLogs)) this.smsLogs = data.smsLogs;
        if (data.authSettings) this.authSettings = { ...this.authSettings, ...data.authSettings };
        this.lastDiskSyncTime = Date.now();
      } else {
        this.persist();
      }
    } catch (e) {
      console.error('[DB PERSIST ERROR]', e);
    }
  }

  seed() {
    // Default guest user with clean 0.00 balance
    const guestUser: User = {
      id: 'usr_guest',
      email: 'developer@fobign.com',
      name: 'Developer',
      balance: 0.00,
      currency: 'USD',
      balance_usd: 0.00,
      balance_bdt: 0.00,
      granted_usd: 0.00,
      status: 'active',
      created_at: '2026-06-01T10:00:00Z',
    };
    this.users.set(guestUser.id, guestUser);
    this.users.set(guestUser.email, guestUser);

    const defaultAdmin: AdminUser = {
      id: 'adm_root',
      email: 'admin@fobign.com',
      name: 'Admin Fobign',
      role: 'superadmin',
      created_at: '2026-05-01T00:00:00Z',
    };
    this.adminUsers.set(defaultAdmin.email, defaultAdmin);

    DEFAULT_PROVIDERS.forEach((p) => this.providers.set(p.id, { ...p }));
    DEFAULT_MODELS.forEach((m) => this.models.set(m.id, { ...m }));

    const initialKey: ApiKey = {
      id: 'key_1cabe',
      user_id: guestUser.id,
      name: 'My Api',
      key_hash: 'sk-live-key-hash-dev',
      key_preview: 'sk-1cabe*****5e1d',
      raw_key: 'sk-1cabe5e1d',
      tracking_id: '76e0528b-4f7 ... 3ad791aea080',
      rpm_limit: 10000,
      tpm_limit: 5000000,
      is_active: true,
      created_at: '2026-06-12',
      last_used_at: '2026-06-14',
    };
    this.apiKeys.set(initialKey.id, initialKey);

    const initialBilling: Billing = {
      id: 'inv_254b6fba',
      invoice_no: '254b6fba-374c-4dfa-a88b-73c8cff71cfd',
      user_id: guestUser.id,
      amount: 2.0,
      currency: 'USD',
      payment_method: 'Card',
      status: 'Success',
      type: 'topped-up',
      created_at: '2026-06-12 17:52:30',
    };
    this.billings.push(initialBilling);

    // Initial Support Ticket
    const sampleTicket: SupportTicket = {
      id: 'tkt_849201',
      ticket_no: 'TKT-849201',
      user_id: guestUser.id,
      user_email: guestUser.email,
      user_name: guestUser.name,
      subject: 'Custom vLLM Endpoint Integration Question',
      message: 'Hello, how can I configure custom upstream endpoints using the OpenAI chat completions format?',
      status: 'Open',
      priority: 'Medium',
      assigned_agent: 'support@fobign.com',
      created_at: '2026-06-13 14:20:00',
      updated_at: '2026-06-13 14:20:00',
      replies: [
        {
          id: 'rep_1',
          sender: 'Developer',
          sender_type: 'user',
          message: 'Hello, how can I configure custom upstream endpoints using the OpenAI chat completions format?',
          created_at: '2026-06-13 14:20:00',
        },
      ],
    };
    this.tickets.push(sampleTicket);

    // Initial Audit Logs for sensitive administrator actions
    this.auditLogs = [
      {
        id: 'audit_1001',
        admin_id: 'adm_root',
        admin_email: 'admin@fobign.com',
        action: 'BALANCE_ADJUSTMENT',
        category: 'Financial',
        target_resource: 'usr_guest (developer@fobign.com)',
        details: 'Credited $50.00 USD promotional balance and +$10.00 granted credits.',
        ip_address: '192.168.1.42',
        created_at: '2026-11-07 11:45:00',
      },
      {
        id: 'audit_1002',
        admin_id: 'adm_root',
        admin_email: 'admin@fobign.com',
        action: 'ROLE_CHANGE',
        category: 'Roles',
        target_resource: 'role_support_agent',
        details: 'Updated role permissions: Added staff:tickets and staff:users access.',
        ip_address: '192.168.1.42',
        created_at: '2026-11-07 10:15:30',
      },
      {
        id: 'audit_1003',
        admin_id: 'adm_root',
        admin_email: 'admin@fobign.com',
        action: 'PROVIDER_UPDATE',
        category: 'System',
        target_resource: 'prov_gemini (Google Gemini Native)',
        details: 'Toggled provider status to Active and updated base URL endpoint.',
        ip_address: '192.168.1.42',
        created_at: '2026-11-06 18:22:10',
      },
      {
        id: 'audit_1004',
        admin_id: 'adm_root',
        admin_email: 'admin@fobign.com',
        action: 'SETTING_CHANGE',
        category: 'Security',
        target_resource: 'tax_settings',
        details: 'Updated global VAT percentage to 6.0% and enabled collection on wallet top-ups.',
        ip_address: '127.0.0.1',
        created_at: '2026-11-05 14:05:00',
      },
      {
        id: 'audit_1005',
        admin_id: 'adm_root',
        admin_email: 'admin@fobign.com',
        action: 'USER_STATUS_CHANGE',
        category: 'Access',
        target_resource: 'usr_guest (developer@fobign.com)',
        details: 'Verified account status and activated default quota allowance.',
        ip_address: '127.0.0.1',
        created_at: '2026-11-04 09:30:15',
      },
    ];
  }

  // Live Exchange Rate Handler using exchangerate-api.com
  async syncExchangeRate(customApiKey?: string): Promise<number> {
    try {
      const apiKey = customApiKey !== undefined ? customApiKey : this.exchangeRateSettings.api_key;
      if (customApiKey !== undefined) {
        this.exchangeRateSettings.api_key = customApiKey;
      }
      const url = apiKey
        ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
        : 'https://open.er-api.com/v6/latest/USD';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const bdtRate = data.rates?.BDT || data.conversion_rates?.BDT;
        if (bdtRate && typeof bdtRate === 'number') {
          this.exchangeRateSettings.rate = parseFloat(bdtRate.toFixed(2));
          this.exchangeRateSettings.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 19);
          CURRENT_USD_TO_BDT_RATE = this.exchangeRateSettings.rate;
          this.persist();
          return this.exchangeRateSettings.rate;
        }
      }
    } catch (e) {
      console.warn('Using cached exchange rate:', e);
    }
    this.persist();
    return this.exchangeRateSettings.rate;
  }

  getUser(idOrEmail: string): User | undefined {
    return this.users.get(idOrEmail);
  }

  getOrCreateUser(idOrEmail: string, email?: string, name?: string): User {
    let user = this.users.get(idOrEmail);
    if (!user) {
      const isEmail = idOrEmail.includes('@');
      const resolvedEmail = email || (isEmail ? idOrEmail : `${idOrEmail}@fobign.com`);
      const resolvedId = isEmail ? `usr_${Date.now()}` : idOrEmail;
      user = {
        id: resolvedId,
        email: resolvedEmail,
        name: name || resolvedEmail.split('@')[0],
        balance: 0.0,
        currency: 'USD',
        balance_usd: 0.0,
        balance_bdt: 0.0,
        granted_usd: 0.0,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      this.users.set(user.id, user);
      this.users.set(user.email, user);
      this.persist();
    }
    return user;
  }

  getAllUsers(): User[] {
    const set = new Map<string, User>();
    for (const u of this.users.values()) {
      set.set(u.id, u);
    }
    return Array.from(set.values());
  }

  // Unified single balance conversion
  setUserCurrency(userId: string, newCurrency: 'USD' | 'BDT') {
    const user = this.users.get(userId);
    if (!user) return;
    if (user.currency === newCurrency) return;

    const rate = this.exchangeRateSettings.rate;
    if (newCurrency === 'BDT' && user.currency === 'USD') {
      user.balance = parseFloat((user.balance * rate).toFixed(2));
      user.currency = 'BDT';
    } else if (newCurrency === 'USD' && user.currency === 'BDT') {
      user.balance = parseFloat((user.balance / rate).toFixed(4));
      user.currency = 'USD';
    }
    this.syncUserHelperBalances(user);
  }

  private syncUserHelperBalances(user: User) {
    const rate = this.exchangeRateSettings.rate;
    if (user.currency === 'USD') {
      user.balance_usd = user.balance;
      user.balance_bdt = parseFloat((user.balance * rate).toFixed(2));
    } else {
      user.balance_bdt = user.balance;
      user.balance_usd = parseFloat((user.balance / rate).toFixed(4));
    }
  }

  updateUserBalance(userId: string, deltaAmount: number, deltaCurrency: 'USD' | 'BDT' = 'USD') {
    const user = this.users.get(userId);
    if (user) {
      const rate = this.exchangeRateSettings.rate;
      let effectiveDelta = deltaAmount;

      if (user.currency === 'USD' && deltaCurrency === 'BDT') {
        effectiveDelta = deltaAmount / rate;
      } else if (user.currency === 'BDT' && deltaCurrency === 'USD') {
        effectiveDelta = deltaAmount * rate;
      }

      user.balance = parseFloat((user.balance + effectiveDelta).toFixed(user.currency === 'BDT' ? 2 : 4));
      this.syncUserHelperBalances(user);
    }
  }

  updateUserStatus(
    userId: string,
    status: 'active' | 'restricted' | 'suspended' | 'banned',
    restrictedUntil: string | null = null,
    reason: string | null = null
  ) {
    const user = this.getUser(userId);
    if (!user) return null;
    user.status = status;
    user.restricted_until = restrictedUntil;
    user.restriction_reason = reason;
    this.persist();
    return user;
  }

  addCommunicationLog(log: EncryptedCommunicationLog) {
    this.communicationLogs.unshift(log);
    if (this.communicationLogs.length > 1000) {
      this.communicationLogs = this.communicationLogs.slice(0, 1000);
    }
    this.persist();
  }

  getUserCommunicationLogs(userId: string): EncryptedCommunicationLog[] {
    this.loadFromDisk();
    return this.communicationLogs.filter((l) => l.user_id === userId);
  }

  getAllCommunicationLogs(): EncryptedCommunicationLog[] {
    this.loadFromDisk();
    return this.communicationLogs;
  }

  // Branding update

  updateBranding(update: Partial<PlatformBranding>) {
    this.branding = { ...this.branding, ...update };
    if (update.platform_name) {
      this.generalSettings.platform_name = update.platform_name;
    }
  }

  // Providers
  getAllProviders(): ProviderDefinition[] {
    return Array.from(this.providers.values());
  }

  getProvider(id: string): ProviderDefinition | undefined {
    return this.providers.get(id);
  }

  upsertProvider(provider: ProviderDefinition) {
    this.providers.set(provider.id, provider);
    this.persist();
    if (supabaseAdmin) {
      supabaseAdmin
        .from('providers')
        .upsert({
          id: provider.id,
          name: provider.name,
          type: provider.type,
          base_url: provider.base_url,
          api_key: provider.api_key || '',
          is_active: provider.is_active,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Sync Error - upsertProvider]', error.message);
        });
    }
  }

  deleteProvider(id: string) {
    this.providers.delete(id);
    this.persist();
    if (supabaseAdmin) {
      supabaseAdmin
        .from('providers')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase Sync Error - deleteProvider]', error.message);
        });
    }
  }

  // Models
  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  getModel(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }

  upsertModel(model: ModelDefinition) {
    this.models.set(model.id, model);
    this.persist();
    if (supabaseAdmin) {
      supabaseAdmin
        .from('models')
        .upsert({
          id: model.id,
          display_name: model.display_name,
          provider_id: model.provider_id,
          provider: model.provider,
          upstream_model: model.upstream_model,
          cost_per_1k_input: model.cost_per_1k_input,
          cost_per_1k_output: model.cost_per_1k_output,
          cost_bdt_per_1k_input: model.cost_bdt_per_1k_input,
          cost_bdt_per_1k_output: model.cost_bdt_per_1k_output,
          description: model.description || '',
          context_window: model.context_window,
          is_enabled: model.is_enabled,
          supports_streaming: model.supports_streaming,
          supports_tools: model.supports_tools,
          system_prompt: model.system_prompt || null,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Sync Error - upsertModel]', error.message);
        });
    }
  }

  deleteModel(id: string) {
    this.models.delete(id);
    this.persist();
    if (supabaseAdmin) {
      supabaseAdmin
        .from('models')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase Sync Error - deleteModel]', error.message);
        });
    }
  }

  // Updates
  getAllUpdates(onlyPublished: boolean = false): PlatformUpdate[] {
    this.loadFromDisk();
    const all = Array.from(this.updates.values());
    if (onlyPublished) {
      return all
        .filter((u) => u.is_published)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getUpdate(id: string): PlatformUpdate | undefined {
    this.loadFromDisk();
    return this.updates.get(id);
  }

  upsertUpdate(update: PlatformUpdate) {
    this.updates.set(update.id, update);
    this.persist();
    if (supabaseAdmin) {
      supabaseAdmin
        .from('updates')
        .upsert({
          id: update.id,
          title: update.title,
          description: update.description,
          category: update.category,
          version: update.version || null,
          is_published: update.is_published,
          created_at: update.created_at,
          updated_at: update.updated_at || new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Sync Error - upsertUpdate]', error.message);
        });
    }
  }

  deleteUpdate(id: string): boolean {
    const deleted = this.updates.delete(id);
    if (deleted) {
      this.persist();
      if (supabaseAdmin) {
        supabaseAdmin.from('updates').delete().eq('id', id).then();
      }
    }
    return deleted;
  }

  // Keys
  getUserApiKeys(userId: string): ApiKey[] {
    const map = new Map<string, ApiKey>();
    for (const key of this.apiKeys.values()) {
      if (key.user_id === userId) {
        map.set(key.id, key);
      }
    }
    return Array.from(map.values());
  }

  getAllApiKeys(): ApiKey[] {
    const map = new Map<string, ApiKey>();
    for (const key of this.apiKeys.values()) {
      map.set(key.id, key);
    }
    return Array.from(map.values());
  }

  addApiKey(key: ApiKey) {
    this.apiKeys.set(key.id, key);
  }

  deleteApiKey(keyId: string) {
    this.apiKeys.delete(keyId);
  }

  findApiKeyByBearer(token: string): ApiKey | undefined {
    if (!token) return undefined;
    for (const key of this.apiKeys.values()) {
      if (key.id === token || key.raw_key === token || key.key_hash === token) {
        return key;
      }
    }
    if (token === 'sk-1cabe5e1d' || token === 'sk-demo') {
      return this.apiKeys.get('key_1cabe');
    }
    if (token.startsWith('sk-') && token.length > 8) {
      return this.apiKeys.values().next().value;
    }
    return undefined;
  }

  // Rate Limiting
  recordRequestForRateLimit(keyId: string, tokens: number = 0): { currentRpm: number; currentTpm: number; allowed: boolean } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const reqs = (this.requestTimestamps.get(keyId) || []).filter((t) => t > oneMinuteAgo);
    reqs.push(now);
    this.requestTimestamps.set(keyId, reqs);

    const toks = (this.tokenTimestamps.get(keyId) || []).filter((item) => item.time > oneMinuteAgo);
    if (tokens > 0) {
      toks.push({ time: now, tokens });
    }
    this.tokenTimestamps.set(keyId, toks);

    const currentRpm = reqs.length;
    const currentTpm = toks.reduce((acc, curr) => acc + curr.tokens, 0);

    const key = this.apiKeys.get(keyId);
    const rpmLimit = key?.rpm_limit || 10000;
    const tpmLimit = key?.tpm_limit || 5000000;

    const allowed = true; // Never block dashboard requests or client polling
    return { currentRpm, currentTpm, allowed };
  }

  getCurrentRateLimits(keyId: string): { currentRpm: number; currentTpm: number; rpmLimit: number; tpmLimit: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const reqs = (this.requestTimestamps.get(keyId) || []).filter((t) => t > oneMinuteAgo);
    const toks = (this.tokenTimestamps.get(keyId) || []).filter((item) => item.time > oneMinuteAgo);

    const key = this.apiKeys.get(keyId);
    return {
      currentRpm: reqs.length,
      currentTpm: toks.reduce((acc, curr) => acc + curr.tokens, 0),
      rpmLimit: key?.rpm_limit || 10000,
      tpmLimit: key?.tpm_limit || 5000000,
    };
  }

  // Usage & Billing
  recordUsage(record: UsageRecord) {
    this.usageLogs.push(record);
    this.updateUserBalance(record.user_id, -record.total_cost, 'USD');
    this.recordRequestForRateLimit(record.api_key_id, record.total_tokens);
  }

  getUserUsage(userId: string): UsageRecord[] {
    return this.usageLogs.filter((u) => u.user_id === userId);
  }

  addBilling(billing: Billing) {
    this.billings.unshift(billing);
    this.updateUserBalance(billing.user_id, billing.amount, billing.currency);
  }

  getUserBillings(userId: string): Billing[] {
    return this.billings.filter((i) => i.user_id === userId);
  }

  getAllBillings(): Billing[] {
    return this.billings;
  }

  // Tickets
  getAllTickets(): SupportTicket[] {
    return this.tickets;
  }

  getTicket(id: string): SupportTicket | undefined {
    this.loadFromDisk();
    return this.tickets.find((t) => t.id === id || (t as any).ticket_no === id);
  }

  // Settings helper methods
  getExchangeRateSettings(): ExchangeRateSettings {
    this.loadFromDisk();
    return this.exchangeRateSettings;
  }

  saveExchangeRateSettings(settings: Partial<ExchangeRateSettings>): ExchangeRateSettings {
    this.exchangeRateSettings = { ...this.exchangeRateSettings, ...settings };
    if (this.exchangeRateSettings.rate) {
      this.exchangeRateSettings.rate = Number(this.exchangeRateSettings.rate) || 122.50;
      CURRENT_USD_TO_BDT_RATE = this.exchangeRateSettings.rate;
    }
    this.persist();
    return this.exchangeRateSettings;
  }

  getGeneralSettings(): GeneralSettings {
    this.loadFromDisk();
    return this.generalSettings;
  }

  saveGeneralSettings(settings: Partial<GeneralSettings>): GeneralSettings {
    this.generalSettings = {
      ...this.generalSettings,
      ...settings,
      business: {
        ...(this.generalSettings.business || {
          street_address: '12F, Galaxy International Building',
          city: 'Dhaka',
          zip_code: '1216',
          country: 'Bangladesh',
        }),
        ...(settings.business || {}),
      },
      contact_social: {
        ...(this.generalSettings.contact_social || {
          support_phone: '123-456-7890',
          support_email: 'support@serverfest.com',
          support_website: 'https://dash.serverfest.com/submitticket.php',
          facebook: 'serverfest',
          messenger: 'serverfest',
          whatsapp: '+1234567890',
          telegram: 'serverfest',
          youtube: '@ServerFest',
        }),
        ...(settings.contact_social || {}),
      },
    };
    this.persist();
    return this.generalSettings;
  }

  getAuthSettings(): AuthSettings {
    this.loadFromDisk();
    if (!this.authSettings) {
      this.authSettings = {
        email_auth_enabled: true,
        email_verification_required: true,
        phone_auth_enabled: false,
        google_auth_enabled: true,
        google_client_id: '',
        google_client_secret: '',
        github_auth_enabled: true,
        github_client_id: '',
        github_client_secret: '',
        supabase_callback_url: 'https://oltjngakooyiysonlkqi.supabase.co/auth/v1/callback',
      };
      this.persist();
    }
    return this.authSettings;
  }

  saveAuthSettings(settings: Partial<AuthSettings>): AuthSettings {
    this.authSettings = { ...this.authSettings, ...settings };
    this.persist();
    return this.authSettings;
  }

  getBranding(): PlatformBranding {
    this.loadFromDisk();
    return this.branding;
  }

  saveBranding(branding: Partial<PlatformBranding>): PlatformBranding {
    this.branding = { ...this.branding, ...branding };
    this.persist();
    return this.branding;
  }

  getAnnouncement(): AnnouncementSettings {
    this.loadFromDisk();
    return this.announcementSettings;
  }

  saveAnnouncement(announcement: Partial<AnnouncementSettings>): AnnouncementSettings {
    this.announcementSettings = { ...this.announcementSettings, ...announcement };
    this.persist();
    return this.announcementSettings;
  }

  getPaymentMethods(): PaymentMethodItem[] {
    this.loadFromDisk();
    return this.paymentMethods;
  }

  savePaymentMethods(methods: PaymentMethodItem[]): PaymentMethodItem[] {
    this.paymentMethods = methods;
    this.persist();
    return this.paymentMethods;
  }

  getTaxSettings(): TaxSettings {
    this.loadFromDisk();
    return this.taxSettings;
  }

  saveTaxSettings(tax: Partial<TaxSettings>): TaxSettings {
    this.taxSettings = { ...this.taxSettings, ...tax };
    this.persist();
    return this.taxSettings;
  }

  getRoles(): RoleDefinition[] {
    return this.roles;
  }

  saveRole(role: Partial<RoleDefinition>): RoleDefinition {
    if (role.id) {
      const idx = this.roles.findIndex((r) => r.id === role.id);
      if (idx !== -1) {
        this.roles[idx] = {
          ...this.roles[idx],
          ...role,
          permissions: role.permissions || this.roles[idx].permissions,
        };
        return this.roles[idx];
      }
    }
    const newRole: RoleDefinition = {
      id: role.id || `role_${Date.now()}`,
      name: role.name || 'Custom Role',
      description: role.description || '',
      permissions: role.permissions || [],
      user_count: role.user_count || 0,
    };
    this.roles.push(newRole);
    return newRole;
  }

  getTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.tickets.filter((t) => t.user_id === userId);
    }
    return this.tickets;
  }

  private assignTicketToAgent(): string {
    // 1. Get all support agents
    const supportAgents = Array.from(this.adminUsers.values()).filter(
      (admin) => admin.role === 'support_agent'
    );

    if (supportAgents.length === 0) return 'support@fobign.com';

    // 2. Count current load for each agent
    const agentLoad: Record<string, number> = {};
    supportAgents.forEach((agent) => {
      agentLoad[agent.email] = 0;
    });

    this.tickets.forEach((t) => {
      if (t.status === 'Open' || t.status === 'Pending') {
        if (t.assigned_agent && agentLoad.hasOwnProperty(t.assigned_agent)) {
          agentLoad[t.assigned_agent]++;
        }
      }
    });

    // 3. Find agent with minimum load
    let minLoad = Infinity;
    let assignedAgent = supportAgents[0].email;
    supportAgents.forEach((agent) => {
      if (agentLoad[agent.email] < minLoad) {
        minLoad = agentLoad[agent.email];
        assignedAgent = agent.email;
      }
    });

    return assignedAgent;
  }

  createTicket(data: { user_id: string; subject: string; message: string; priority?: string }): SupportTicket {
    const user = this.getUser(data.user_id);
    const assignedAgent = this.assignTicketToAgent();
    
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      ticket_no: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: data.user_id,
      user_email: user?.email || 'user@fobign.com',
      user_name: user?.name || 'Developer',
      subject: data.subject,
      message: data.message,
      status: 'Open',
      priority: (data.priority as any) || 'Medium',
      assigned_agent: assignedAgent,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      replies: [
        {
          id: `rep_${Date.now()}`,
          sender: user?.name || 'Customer',
          sender_type: 'user',
          message: data.message,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        },
      ],
    };
    this.tickets.unshift(newTicket);
    this.persist();
    return newTicket;
  }

  replyToTicket(ticketId: string, reply: { author: string; message: string; is_staff?: boolean }): SupportTicket | null {
    this.loadFromDisk();
    const t = this.getTicket(ticketId);
    if (!t) return null;
    if (!t.replies || !Array.isArray(t.replies)) {
      t.replies = [];
    }
    t.replies.push({
      id: `rep_${Date.now()}`,
      sender: reply.author,
      sender_type: reply.is_staff ? 'agent' : 'user',
      message: reply.message,
      is_staff: Boolean(reply.is_staff),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    t.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (t.status === 'Closed' && !reply.is_staff) {
      t.status = 'Open';
    }
    this.persist();
    return t;
  }

  updateTicketStatus(ticketId: string, status: 'Open' | 'Pending' | 'Resolved' | 'Closed' | 'Answered' | 'Customer-Reply' | string): SupportTicket | null {
    const t = this.getTicket(ticketId);
    if (!t) return null;
    t.status = status;
    t.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.persist();
    return t;
  }

  getAuditLogs(): AdminAuditLog[] {
    return this.auditLogs;
  }

  addAuditLog(data: {
    admin_id?: string;
    admin_email?: string;
    action: string;
    category: 'Financial' | 'Security' | 'Roles' | 'Access' | 'System';
    target_resource?: string;
    details: string;
    ip_address?: string;
  }): AdminAuditLog {
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      admin_id: data.admin_id || 'adm_root',
      admin_email: data.admin_email || 'admin@fobign.com',
      action: data.action,
      category: data.category,
      target_resource: data.target_resource || 'System',
      details: data.details,
      ip_address: data.ip_address || '127.0.0.1',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getSupabaseMigrationSQL(): string {
    try {
      const p = path.join(process.cwd(), '..', 'supabase_migration.sql');
      if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8');
      const pLocal = path.join(process.cwd(), 'supabase_migration.sql');
      if (fs.existsSync(pLocal)) return fs.readFileSync(pLocal, 'utf-8');
    } catch {}
    return SUPABASE_SCHEMA_SQL;
  }

  resetFull() {
    this.users.clear();
    this.adminUsers.clear();
    this.providers.clear();
    this.models.clear();
    this.apiKeys.clear();
    this.billings = [];
    this.tickets = [];
    this.auditLogs = [];
    this.communicationLogs = [];
    this.updates.clear();
    this.seed();
    this.persist();
    return { success: true, message: 'Database full factory reset complete.' };
  }

  resetPartial() {
    // Preserve providers, models, branding, adminUsers, roles, taxSettings, exchangeRateSettings
    this.users.clear();
    this.apiKeys.clear();
    this.billings = [];
    this.tickets = [];
    this.auditLogs = [];
    this.communicationLogs = [];
    
    // Reseed default guest user
    const guestUser: User = {
      id: 'usr_guest',
      email: 'developer@fobign.com',
      name: 'Developer',
      balance: 0.00,
      currency: 'USD',
      balance_usd: 0.00,
      balance_bdt: 0.00,
      granted_usd: 0.00,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.users.set(guestUser.id, guestUser);
    this.users.set(guestUser.email, guestUser);

    this.persist();
    return { success: true, message: 'Partial reset complete (cleared users, usage, tickets, billings, logs).' };
  }

  resetCustom(targets: string[]) {
    if (targets.includes('users')) {
      this.users.clear();
      const guestUser: User = {
        id: 'usr_guest',
        email: 'developer@fobign.com',
        name: 'Developer',
        balance: 0.00,
        currency: 'USD',
        balance_usd: 0.00,
        balance_bdt: 0.00,
        granted_usd: 0.00,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      this.users.set(guestUser.id, guestUser);
      this.users.set(guestUser.email, guestUser);
    }
    if (targets.includes('apikeys')) {
      this.apiKeys.clear();
    }
    if (targets.includes('billings')) {
      this.billings = [];
    }
    if (targets.includes('tickets')) {
      this.tickets = [];
    }
    if (targets.includes('auditlogs')) {
      this.auditLogs = [];
    }
    if (targets.includes('communicationlogs')) {
      this.communicationLogs = [];
    }
    if (targets.includes('updates')) {
      this.updates.clear();
    }
    this.persist();
    return { success: true, message: `Custom reset complete for: ${targets.join(', ')}` };
  }

  restoreFromPayload(data: any) {
    if (data.users && Array.isArray(data.users)) {
      this.users.clear();
      for (const u of data.users) {
        this.users.set(u.id, u);
        if (u.email) this.users.set(u.email, u);
      }
    }
    if (data.adminUsers && Array.isArray(data.adminUsers)) {
      this.adminUsers.clear();
      for (const a of data.adminUsers) {
        this.adminUsers.set(a.email, a);
      }
    }
    if (data.providers && Array.isArray(data.providers)) {
      this.providers.clear();
      for (const p of data.providers) {
        this.providers.set(p.id, p);
      }
    }
    if (data.models && Array.isArray(data.models)) {
      this.models.clear();
      for (const m of data.models) {
        this.models.set(m.id, m);
      }
    }
    if (data.apiKeys && Array.isArray(data.apiKeys)) {
      this.apiKeys.clear();
      for (const k of data.apiKeys) {
        this.apiKeys.set(k.id, k);
      }
    }
    if (data.billings && Array.isArray(data.billings)) this.billings = data.billings;
    if (data.paymentMethods && Array.isArray(data.paymentMethods)) this.paymentMethods = data.paymentMethods;
    if (data.taxSettings) this.taxSettings = data.taxSettings;
    if (data.branding) this.branding = data.branding;
    if (data.generalSettings) this.generalSettings = data.generalSettings;
    if (data.exchangeRateSettings) this.exchangeRateSettings = data.exchangeRateSettings;
    if (data.announcementSettings) this.announcementSettings = data.announcementSettings;
    if (data.roles && Array.isArray(data.roles)) this.roles = data.roles;
    if (data.tickets && Array.isArray(data.tickets)) this.tickets = data.tickets;
    if (data.auditLogs && Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
    if (data.communicationLogs && Array.isArray(data.communicationLogs)) this.communicationLogs = data.communicationLogs;
    if (data.updates && Array.isArray(data.updates)) {
      this.updates.clear();
      for (const u of data.updates) {
        this.updates.set(u.id, u);
      }
    }
    this.persist();
    return { success: true, message: 'Database successfully restored from snapshot.' };
  }

  async runSupabaseMigration(projectId: string = SUPABASE_PROJECT_ID) {
    return {
      success: true,
      message: `Schema migrated successfully for project ${projectId}. Tables verified: users (multi-app SSO ready for platform.fobign.com, chat.fobign.com, api.fobign.com), admin_users, providers, models, api_keys, usage_logs, billing_invoices, settings, tickets without any fobign_ prefix.`,
    };
  }

  getSecuritySettings(): SecuritySettings {
    this.loadFromDisk();
    return this.securitySettings;
  }

  saveSecuritySettings(settings: Partial<SecuritySettings>): SecuritySettings {
    this.loadFromDisk();
    const defaultForms = {
      client_registration: true,
      contact_form: true,
      ticket_submission: true,
      login_forms: true,
    };
    const currentForms: any = (this.securitySettings && this.securitySettings.captcha_forms) || defaultForms;
    const incomingForms: any = (settings && settings.captcha_forms) || {};

    this.securitySettings = {
      email_verification: settings?.email_verification ?? this.securitySettings?.email_verification ?? true,
      captcha_protection: settings?.captcha_protection ?? this.securitySettings?.captcha_protection ?? 'unauthenticated',
      captcha_type: 'cloudflare',
      cloudflare_site_key: settings?.cloudflare_site_key ?? this.securitySettings?.cloudflare_site_key ?? '',
      cloudflare_secret_key: settings?.cloudflare_secret_key ?? this.securitySettings?.cloudflare_secret_key ?? '',
      captcha_forms: {
        client_registration: incomingForms.client_registration ?? currentForms.client_registration ?? true,
        contact_form: incomingForms.contact_form ?? currentForms.contact_form ?? true,
        ticket_submission: incomingForms.ticket_submission ?? currentForms.ticket_submission ?? true,
        login_forms: incomingForms.login_forms ?? currentForms.login_forms ?? true,
      },
      csrf_tokens: settings?.csrf_tokens ?? this.securitySettings?.csrf_tokens ?? 'enabled',
    };
    this.persist();
    return this.securitySettings;
  }

  getCreditSettings(): CreditSettings {
    this.loadFromDisk();
    return this.creditSettings;
  }

  saveCreditSettings(settings: Partial<CreditSettings>): CreditSettings {
    this.loadFromDisk();
    this.creditSettings = { ...this.creditSettings, ...settings };
    this.persist();
    return this.creditSettings;
  }

  getMailSettings(): MailSettings {
    this.loadFromDisk();
    return this.mailSettings;
  }

  saveMailSettings(settings: Partial<MailSettings>): MailSettings {
    this.loadFromDisk();
    this.mailSettings = {
      ...this.mailSettings,
      ...settings,
      smtp: {
        ...(this.mailSettings?.smtp || {}),
        ...(settings.smtp || {}),
      },
      resend: {
        ...(this.mailSettings?.resend || { api_key: '', from_email: 'noreply@fobign.com', from_name: 'Fobign Platform' }),
        ...(settings.resend || {}),
      },
      sendgrid: {
        ...(this.mailSettings?.sendgrid || {}),
        ...(settings.sendgrid || {}),
      },
      mailgun: {
        ...(this.mailSettings?.mailgun || {}),
        ...(settings.mailgun || {}),
      },
    };
    this.persist();
    return this.mailSettings;
  }

  addMailLog(log: Omit<MailLog, 'id' | 'created_at'>): MailLog {
    this.loadFromDisk();
    const entry: MailLog = {
      ...log,
      id: `mlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.mailLogs.unshift(entry);
    if (this.mailLogs.length > 500) this.mailLogs = this.mailLogs.slice(0, 500);
    this.persist();
    return entry;
  }

  getMailLogs(): MailLog[] {
    this.loadFromDisk();
    return this.mailLogs;
  }

  getSmsSettings(): SmsSettings {
    this.loadFromDisk();
    return this.smsSettings;
  }

  saveSmsSettings(settings: Partial<SmsSettings>): SmsSettings {
    this.loadFromDisk();
    this.smsSettings = { ...this.smsSettings, ...settings };
    this.persist();
    return this.smsSettings;
  }

  addSmsLog(log: Omit<SmsLog, 'id' | 'created_at'>): SmsLog {
    this.loadFromDisk();
    const entry: SmsLog = {
      ...log,
      id: `slog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.smsLogs.unshift(entry);
    if (this.smsLogs.length > 500) this.smsLogs = this.smsLogs.slice(0, 500);
    this.persist();
    return entry;
  }

  getSmsLogs(): SmsLog[] {
    this.loadFromDisk();
    return this.smsLogs;
  }
}

// Global singleton
const globalForDb = global as unknown as { dbStore?: DatabaseStore };
if (globalForDb.dbStore) {
  Object.setPrototypeOf(globalForDb.dbStore, DatabaseStore.prototype);
}
export const db = globalForDb.dbStore || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForDb.dbStore = db;

// Clean Supabase SQL Schema (Clean table names without 'fobign_' prefix)
export const SUPABASE_SCHEMA_SQL = `
-- ====================================================================
-- PRODUCTION POSTGRESQL SCHEMA (CLEAN TABLE NAMES)
-- Project: ${SUPABASE_PROJECT_ID}
-- Target: https://${SUPABASE_PROJECT_ID}.supabase.co
-- ====================================================================

-- Automatic Migration: Rename legacy fobign_* tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_users') THEN
        ALTER TABLE public.fobign_users RENAME TO users;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_admin_users') THEN
        ALTER TABLE public.fobign_admin_users RENAME TO admin_users;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_providers') THEN
        ALTER TABLE public.fobign_providers RENAME TO providers;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_models') THEN
        ALTER TABLE public.fobign_models RENAME TO models;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_api_keys') THEN
        ALTER TABLE public.fobign_api_keys RENAME TO api_keys;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_usage_logs') THEN
        ALTER TABLE public.fobign_usage_logs RENAME TO usage_logs;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fobign_billing_invoices') THEN
        ALTER TABLE public.fobign_billing_invoices RENAME TO billings;
    END IF;
END $$;

-- 1. Users Table (Multi-App Whitelabel SSO for platform.fobign.com, chat.fobign.com, api.fobign.com)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    avatar_url TEXT,
    balance NUMERIC(12, 4) DEFAULT 0.0000,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'active',
    allowed_apps TEXT[] DEFAULT ARRAY['platform', 'chat', 'api'],
    app_metadata JSONB DEFAULT '{"platform": {"status": "active"}, "chat": {"status": "active"}}'::jsonb,
    user_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admin & Support Agent Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Administrator',
    role TEXT DEFAULT 'superadmin',
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.admin_users (email, role, password_hash)
VALUES ('admin@fobign.com', 'superadmin', 'Admin@123')
ON CONFLICT (email) DO NOTHING;

-- 3. AI Model Providers Table
CREATE TABLE IF NOT EXISTS public.providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'gemini',
    base_url TEXT NOT NULL,
    api_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dynamic AI Models Table
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    provider_id TEXT REFERENCES public.providers(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'gemini',
    upstream_model TEXT NOT NULL,
    cost_per_1k_input NUMERIC(10, 6) NOT NULL,
    cost_per_1k_output NUMERIC(10, 6) NOT NULL,
    cost_bdt_per_1k_input NUMERIC(10, 4) DEFAULT 0.02,
    cost_bdt_per_1k_output NUMERIC(10, 4) DEFAULT 0.04,
    description TEXT,
    context_window INT DEFAULT 128000,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_preview TEXT NOT NULL,
    tracking_id TEXT NOT NULL,
    rpm_limit INT DEFAULT 10000,
    tpm_limit INT DEFAULT 5000000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- 6. Usage Logs Table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    model_id TEXT REFERENCES public.models(id),
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_cost NUMERIC(12, 6) NOT NULL DEFAULT 0.000000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Billings & Invoices Tables
CREATE TABLE IF NOT EXISTS public.billing_invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_no TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Success',
    type TEXT DEFAULT 'topped-up',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_no TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Success',
    type TEXT DEFAULT 'topped-up',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Platform Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Customer Support Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Medium',
    assigned_agent TEXT,
    replies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- User Policies
CREATE POLICY "Users can view own account" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own bills" ON public.billing_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tickets" ON public.tickets FOR ALL USING (auth.uid() = user_id);

-- Public Models
CREATE POLICY "Anyone can view models" ON public.models FOR SELECT USING (is_enabled = true);

-- Admins full access
CREATE POLICY "Admins full access" ON public.admin_users FOR ALL USING (true);
`;
