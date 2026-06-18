import { NextResponse } from 'next/server';
import { AiService } from '@/lib/ai/service';
import { pbFetch, getTenantFilter, getCurrentTenant } from '@/lib/pocketbase';
import { getWebsiteUrl } from '@/lib/websiteUrl';

const DEFAULT_MONTHLY_LIMIT = 500;

interface AiUsageStats {
  tenantId: string
  currentMonth: string
  requestCount: number
  limit: number
  lastRequest: string
}

interface UsageLog {
  id?: string
  website_id: string
  request_type: string
  tokens_used?: number
  cost?: number
  success: boolean
  error_message?: string
  created: string
}

async function getCurrentMonthUsage(tenantId: string): Promise<AiUsageStats> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  try {
    const filter = `website_id = "${tenantId}" && created >= "${currentMonth}-01"`
    const data = await pbFetch(`ai_usage_logs/records?filter=${encodeURIComponent(filter)}&fields=request_type,success&perPage=1000`)
    
    const requestCount = (data.items || []).filter((r: any) => r.success !== false).length
    
    return {
      tenantId,
      currentMonth,
      requestCount,
      limit: DEFAULT_MONTHLY_LIMIT,
      lastRequest: new Date().toISOString(),
    }
  } catch {
    return {
      tenantId,
      currentMonth,
      requestCount: 0,
      limit: DEFAULT_MONTHLY_LIMIT,
      lastRequest: new Date().toISOString(),
    }
  }
}

async function getMonthlyLimit(tenantId: string): Promise<number> {
  try {
    const filter = `(${getTenantFilter()})`
    const data = await pbFetch(`site_settings/records?filter=${encodeURIComponent(filter)}`)
    const mainConfig = data.items?.find((r: any) => r.setting_key === 'main_config')
    if (mainConfig?.setting_value?.ai_monthly_limit) {
      return parseInt(mainConfig.setting_value.ai_monthly_limit, 10) || DEFAULT_MONTHLY_LIMIT
    }
  } catch {}
  return DEFAULT_MONTHLY_LIMIT
}

async function incrementUsage(tenantId: string, requestType: string = 'chat'): Promise<void> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7)
    await pbFetch('ai_usage_logs/records', {
      method: 'POST',
      body: JSON.stringify({
        website_id: tenantId,
        request_type: requestType,
        success: true,
        created: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to log AI usage:', error)
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const tenantId = getCurrentTenant()
    const [usage, limit] = await Promise.all([
      getCurrentMonthUsage(tenantId),
      getMonthlyLimit(tenantId),
    ])

    usage.limit = limit

    if (usage.requestCount >= limit) {
      return NextResponse.json({
        error: `Monthly limit reached`,
        message: `Has exceeded your monthly AI request limit (${limit}). Please try again next month or upgrade your plan.`,
        usage: {
          used: usage.requestCount,
          limit: limit,
          remaining: 0,
          resetsAt: `${usage.currentMonth}-01`,
        },
      }, { status: 429 });
    }

    const ai = new AiService();
    await ai.init();
    
    console.log('[AI API] Calling AI with provider:', ai.getProvider());
    const response = await ai.chat(messages);
    
    await incrementUsage(tenantId, 'chat')

    const updatedUsage = {
      used: usage.requestCount + 1,
      limit: limit,
      remaining: limit - usage.requestCount - 1,
      resetsAt: `${usage.currentMonth}-01`,
    }

    return NextResponse.json({ 
      response,
      usage: updatedUsage,
    });
  } catch (error: any) {
    console.error('[AI API] Error:', error.message);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tenantId = getCurrentTenant()
    const [usage, limit, websiteUrl] = await Promise.all([
      getCurrentMonthUsage(tenantId),
      getMonthlyLimit(tenantId),
      getWebsiteUrl(),
    ])

    usage.limit = limit

    return NextResponse.json({
      tenantId,
      website: websiteUrl,
      usage: {
        used: usage.requestCount,
        limit: limit,
        remaining: Math.max(0, limit - usage.requestCount),
        currentMonth: usage.currentMonth,
        resetsAt: `${usage.currentMonth}-01`,
      },
    })
  } catch (error: any) {
    console.error('[AI Usage API] Error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}
