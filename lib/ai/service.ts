import { pbFetch, getTenantFilter } from '@/lib/pocketbase';

export type AiProvider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom' | 'minimax' | 'minimax-pro' | 'deepseek';

export interface AiSettings {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
}

export class AiService {
  private settings: AiSettings | null = null;

  async init() {
    // Priority 1: Environment Variables (.env)
    const envProvider = process.env.AI_PROVIDER as AiProvider | undefined;
    const envApiKey = process.env.AI_API_KEY;
    const envModel = process.env.AI_MODEL;
    const envBaseUrl = process.env.AI_BASE_URL;

    if (envProvider && envApiKey) {
      console.log(`[AI Service] Using ENV config: provider=${envProvider}`);
      this.settings = {
        provider: envProvider,
        apiKey: envApiKey,
        model: envModel || (envProvider === 'openai' ? 'gpt-4o' : 'auto'),
        baseUrl: envBaseUrl,
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
      };
      return;
    }

    // Priority 2: Database Settings (PocketBase)
    try {
      const filter = `${getTenantFilter()} && setting_key = "ai_config"`;
      console.log('[AI Service] Fetching config from PocketBase with filter:', filter);
      const data = await pbFetch(`site_settings/records?filter=${encodeURIComponent(filter)}&perPage=1`);
      
      const settingsData = data.items?.[0];

      if (settingsData?.setting_value) {
        console.log('[AI Service] Found config in PocketBase:', settingsData.setting_value.provider);
        this.settings = settingsData.setting_value as unknown as AiSettings;
        return;
      } else {
        console.warn('[AI Service] No AI configuration found in PocketBase for this tenant');
      }
    } catch (err: any) {
      console.error('[AI Service] Error fetching config from PocketBase:', err.message);
    }

    // Priority 3: Fallback to DEEPSEEK FLASH (Primary for blog AI)
    const dsKey = process.env.DEEPSEEK_API_KEY;
    if (dsKey) {
      console.log('[AI Service] Using DeepSeek Flash (Primary for blog generation)');
      this.settings = {
        provider: 'deepseek',
        apiKey: dsKey,
        model: 'deepseek-flash', // deepseek-flash or deepseek-chat
        temperature: 0.7
      };
      return;
    }

    // Priority 4: Fallback to environment variables (less preferred)
    const fallbackKey = process.env.VITE_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (fallbackKey) {
      console.log('[AI Service] WARNING: Using OpenRouter fallback - consider using DEEPSEEK_API_KEY');
      this.settings = {
        provider: 'openrouter',
        apiKey: fallbackKey,
        model: 'openrouter/auto',
        temperature: 0.7
      };
    } else {
      console.error('[AI Service] CRITICAL: No AI configuration found. Set DEEPSEEK_API_KEY in .env');
    }
  }

  getProvider() {
    return this.settings?.provider || 'none';
  }

  async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
    if (!this.settings) {
      throw new Error('AI not configured. Please set up your AI Brain in the CMS.');
    }

    const { provider, apiKey, model, baseUrl, temperature = 0.7 } = this.settings;
    
    // Lista de proveedores para el fallback (prioridad configurada por usuario)
    const providersToTry: AiProvider[] = [provider];
    
    // Si el primario no es deepseek, lo agregamos como primer fallback si no es el actual
    if (provider !== 'deepseek') {
      providersToTry.push('deepseek');
    }
    
    // Si el primario es openrouter, el secundario es minimax y viceversa
    if (provider === 'openrouter') {
      providersToTry.push('minimax');
    } else if (provider === 'minimax' || provider === 'minimax-pro') {
      providersToTry.push('openrouter');
    }

    let lastError: any = null;

    for (const currentProvider of providersToTry) {
      try {
        console.log(`[AI Service] Attempting chat with provider: ${currentProvider}`);
        
        // Determinar API Key para el proveedor actual
        let currentApiKey = apiKey;
        let currentModel = model;
        
        if (currentProvider !== provider) {
          // Si estamos en el fallback, buscar la key alternativa
          if (currentProvider === 'deepseek') {
            currentApiKey = process.env.DEEPSEEK_API_KEY || '';
            currentModel = 'deepseek-flash'; // Usar Flash para mejor rendimiento
          } else if (currentProvider === 'minimax') {
            currentApiKey = process.env.MINIMAX_API_KEY || '';
            currentModel = 'abab6.5s-chat';
          } else if (currentProvider === 'openrouter') {
            currentApiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
            currentModel = 'openrouter/auto';
          }
        } else if (provider === 'deepseek') {
          // Asegurar que el proveedor principal deepseek también use flash
          currentModel = 'deepseek-flash';
        }

        if (!currentApiKey) continue;

        switch (currentProvider) {
          case 'openai':
            return await this.callOpenAI(messages, currentApiKey, currentModel, temperature);
          case 'openrouter':
            return await this.callOpenRouter(messages, currentApiKey, currentModel, temperature);
          case 'anthropic':
            return await this.callAnthropic(messages, currentApiKey, currentModel, temperature);
          case 'google':
            return await this.callGoogle(messages, currentApiKey, currentModel, temperature);
          case 'deepseek':
            return await this.callDeepSeek(messages, currentApiKey, currentModel, temperature);
          case 'custom':
            return await this.callCustom(messages, currentApiKey, currentModel, baseUrl, temperature);
          case 'minimax':
            return await this.callMinimax(messages, currentApiKey, currentModel, temperature, baseUrl);
          case 'minimax-pro':
            return await this.callMinimaxPro(messages, currentApiKey, currentModel, temperature, baseUrl);
          default:
            continue;
        }
      } catch (err: any) {
        console.error(`[AI Service] Error with provider ${currentProvider}:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error(`Failed to get response from any AI provider (${providersToTry.join(', ')})`);
  }

  private async callOpenAI(messages: any[], apiKey: string, model: string, temperature: number) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenAI Error');
    return data.choices[0].message.content;
  }

  private async callOpenRouter(messages: any[], apiKey: string, model: string, temperature: number) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-Title': 'Inteli-Nex CMS',
      },
      body: JSON.stringify({
        model: model || 'openrouter/auto',
        messages,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenRouter Error');
    return data.choices[0].message.content;
  }

  private async callAnthropic(messages: any[], apiKey: string, model: string, temperature: number) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
        max_tokens: 4096,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Anthropic Error');
    return data.content[0].text;
  }

  private async callGoogle(messages: any[], apiKey: string, model: string, temperature: number) {
     // Implementation for Gemini
     const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature }
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Gemini Error');
    return data.candidates[0].content.parts[0].text;
  }

  private async callCustom(messages: any[], apiKey: string, model: string, baseUrl?: string, temperature?: number) {
    if (!baseUrl) throw new Error('Base URL is required for custom provider');
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey ? `Bearer ${apiKey}` : '',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Custom Provider Error');
    return data.choices[0].message.content;
  }

  private async callMinimax(messages: any[], apiKey: string, model: string, temperature: number, baseUrl?: string) {
    const url = baseUrl || 'https://api.minimax.chat/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'abab6.5s-chat',
        messages,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Minimax Error');
    return data.choices[0].message.content;
  }

  private async callMinimaxPro(messages: any[], apiKey: string, model: string, temperature: number, baseUrl?: string) {
    // For Minimax Token Plan, use the OpenAI-compatible format.
    // pero permitimos configurar un endpoint personalizado si es necesario.
    const url = baseUrl || 'https://api.minimax.chat/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'abab6.5s-chat',
        messages,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Minimax Pro Error');
    return data.choices[0].message.content;
  }

  private async callDeepSeek(messages: any[], apiKey: string, model: string, temperature: number) {
    // DeepSeek API usa 'deepseek-chat' para todos los modelos (flash y normal)
    // El parámetro de modelo se ignora, siempre usa deepseek-chat
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.error?.message || data.error?.code || 'DeepSeek Error';
      console.error('[DeepSeek API Error]:', errorMsg);
      throw new Error(`DeepSeek Error: ${errorMsg}`);
    }
    return data.choices[0].message.content;
  }
}
