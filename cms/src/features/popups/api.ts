import { pb, TENANT_ID } from '@/lib/pocketbase'
import type { PopupData, PopupStats } from './types'

export async function getWebsiteId(): Promise<string> {
  if (pb.authStore.model?.website_id) {
    return pb.authStore.model.website_id;
  }
  return TENANT_ID
}

export async function listPopups(): Promise<PopupData[]> {
  const websiteId = await getWebsiteId()
  try {
    const records = await pb.collection('popups').getFullList({
      filter: `website_id = "${websiteId}"`,
      requestKey: null,
    })
    return records.map(mapDbToPopup)
  } catch (error) {
    console.error('Error listing popups:', error)
    return []
  }
}

export async function createPopup(popup: Omit<PopupData, 'id' | 'created_at' | 'updated_at' | 'views' | 'clicks' | 'conversions'>): Promise<PopupData> {
  const websiteId = await getWebsiteId()
  try {
    const record = await pb.collection('popups').create({
      website_id: websiteId,
      title: popup.title || '',
      is_active: popup.status === 'active',
      trigger_type: popup.trigger || 'time',
      trigger_value: popup.triggerValue ?? 5,
      content: {
        name: popup.name || 'Bez nazwy',
        popup_type: popup.template || 'offer',
        description: popup.description || '',
        buttonText: popup.buttonText || '',
        buttonUrl: popup.buttonUrl || '',
        backgroundColor: popup.backgroundColor || '#ffffff',
        textColor: popup.textColor || '#1f2937',
        accentColor: popup.accentColor || '#0ea5e9',
        targetPages: popup.targetPages || ['all'],
        subtitle: popup.subtitle || '',
        inputPlaceholder: popup.inputPlaceholder || '',
        redirectUrl: popup.redirectUrl || '',
        discountAmount: popup.discountAmount || '',
        discountCode: popup.discountCode || '',
        image: popup.image || '',
        customFields: popup.customFields || [],
        targetDevices: popup.targetDevices || ['desktop', 'mobile', 'tablet'],
        displayFrequency: popup.displayFrequency || 'once',
        displayDelay: popup.displayDelay || 0,
        maxDisplaysPerUser: popup.maxDisplaysPerUser || 1,
        excludePages: popup.excludePages || [],
        scheduledStartsAt: popup.scheduledStartsAt || null,
        scheduledEndsAt: popup.scheduledEndsAt || null,
        views: 0,
        clicks: 0,
        conversions: 0,
        size: popup.size || 'medium',
      }
    })
    return mapDbToPopup(record)
  } catch (error) {
    console.error('[PopupAPI] Error creating popup:', error)
    throw error
  }
}

export async function updatePopup(id: string, updates: Partial<PopupData>): Promise<PopupData> {
  try {
    const existing = await pb.collection('popups').getOne(id)
    const existingContent = existing.content || {}
    
    const patch: any = {
      title: updates.title ?? existing.title ?? '',
      is_active: updates.status === undefined ? existing.is_active : updates.status === 'active',
      trigger_type: updates.trigger ?? existing.trigger_type ?? 'time',
      trigger_value: updates.triggerValue ?? existing.trigger_value ?? 5,
    }
    
    const newContent = {
      ...existingContent,
      name: updates.name ?? existingContent.name ?? 'Bez nazwy',
      popup_type: updates.template ?? existingContent.popup_type ?? 'offer',
      description: updates.description ?? existingContent.description ?? '',
      buttonText: updates.buttonText ?? existingContent.buttonText ?? '',
      buttonUrl: updates.buttonUrl ?? existingContent.buttonUrl ?? '',
      backgroundColor: updates.backgroundColor ?? existingContent.backgroundColor ?? '#ffffff',
      textColor: updates.textColor ?? existingContent.textColor ?? '#1f2937',
      accentColor: updates.accentColor ?? existingContent.accentColor ?? '#0ea5e9',
      targetPages: updates.targetPages ?? existingContent.targetPages ?? ['all'],
      subtitle: updates.subtitle ?? existingContent.subtitle ?? '',
      inputPlaceholder: updates.inputPlaceholder ?? existingContent.inputPlaceholder ?? '',
      redirectUrl: updates.redirectUrl ?? existingContent.redirectUrl ?? '',
      discountAmount: updates.discountAmount ?? existingContent.discountAmount ?? '',
      discountCode: updates.discountCode ?? existingContent.discountCode ?? '',
      image: updates.image ?? existingContent.image ?? '',
      customFields: updates.customFields ?? existingContent.customFields ?? [],
      targetDevices: updates.targetDevices ?? existingContent.targetDevices ?? ['desktop', 'mobile', 'tablet'],
      displayFrequency: updates.displayFrequency ?? existingContent.displayFrequency ?? 'once',
      displayDelay: updates.displayDelay ?? existingContent.displayDelay ?? 0,
      maxDisplaysPerUser: updates.maxDisplaysPerUser ?? existingContent.maxDisplaysPerUser ?? 1,
      excludePages: updates.excludePages ?? existingContent.excludePages ?? [],
      scheduledStartsAt: updates.scheduledStartsAt ?? existingContent.scheduledStartsAt ?? null,
      scheduledEndsAt: updates.scheduledEndsAt ?? existingContent.scheduledEndsAt ?? null,
      size: updates.size ?? existingContent.size ?? 'medium',
    }
    
    patch.content = newContent
    
    const record = await pb.collection('popups').update(id, patch)
    return mapDbToPopup(record)
  } catch (error) {
    console.error('[PopupAPI] Error updating popup:', error)
    throw error
  }
}

export async function deletePopup(id: string): Promise<void> {
  await pb.collection('popups').delete(id)
}

export async function duplicatePopup(id: string): Promise<PopupData> {
  const existing = await pb.collection('popups').getOne(id)
  
  // Clone object and remove ID/timestamps
  const { id: _, created: __, updated: ___, ...dataToClone } = existing as any
  
  const record = await pb.collection('popups').create({
    ...dataToClone,
    title: `${existing.title} (kopia)`,
    content: {
      ...existing.content,
      name: `${existing.content?.name || ''} (kopia)`,
      views: 0,
      clicks: 0,
      conversions: 0,
    }
  })
  return mapDbToPopup(record)
}

export async function getPopupStats(): Promise<PopupStats> {
  const websiteId = await getWebsiteId()
  const records = await pb.collection('popups').getFullList({
    filter: `website_id = "${websiteId}"`,
    requestKey: null,
  })

  let totalViews = 0
  let totalClicks = 0
  let totalConversions = 0

  records.forEach(r => {
    const c = r.content || {}
    totalViews += (c.views || 0)
    totalClicks += (c.clicks || 0)
    totalConversions += (c.conversions || 0)
  })

  return {
    totalViews,
    totalClicks,
    totalConversions,
    avgCtr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0,
    avgConversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 1000) / 10 : 0,
  }
}

function mapDbToPopup(db: any): PopupData {
  const c = db.content || {}
  return {
    id: db.id,
    website_id: db.website_id,
    name: c.name || '',
    template: c.popup_type || 'offer',
    status: db.is_active ? 'active' : 'draft',
    deleted_at: null,
    title: db.title || '',
    subtitle: c.subtitle || '',
    description: c.description || '',
    buttonText: c.buttonText || '',
    buttonUrl: c.buttonUrl || '',
    inputPlaceholder: c.inputPlaceholder || '',
    redirectUrl: c.redirectUrl || '',
    discountAmount: c.discountAmount || '',
    discountCode: c.discountCode || '',
    image: c.image || '',
    customFields: c.customFields || [],
    backgroundColor: c.backgroundColor || '#ffffff',
    accentColor: c.accentColor || '#0ea5e9',
    textColor: c.textColor || '#1f2937',
    targetPages: c.targetPages || ['all'],
    excludePages: c.excludePages || [],
    targetDevices: c.targetDevices || ['desktop', 'mobile', 'tablet'],
    trigger: db.trigger_type || 'time',
    triggerValue: db.trigger_value || 5,
    displayFrequency: c.displayFrequency || 'once',
    displayDelay: c.displayDelay || 0,
    maxDisplaysPerUser: c.maxDisplaysPerUser || 1,
    views: c.views || 0,
    clicks: c.clicks || 0,
    conversions: c.conversions || 0,
    scheduledStartsAt: c.scheduledStartsAt || null,
    scheduledEndsAt: c.scheduledEndsAt || null,
    size: c.size || 'medium',
    created_at: db.created,
    updated_at: db.updated,
  }
}

