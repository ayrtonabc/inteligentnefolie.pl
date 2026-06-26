import { NextResponse } from 'next/server';
import { performOnboardingCheck, getOnboardingMessage } from '@/lib/seo/onboarding';

export async function GET() {
  try {
    const status = await performOnboardingCheck();
    const message = getOnboardingMessage(status);

    return NextResponse.json({
      success: true,
      status,
      message,
    });
  } catch (error) {
    console.error('Onboarding check error:', error);
    return NextResponse.json(
      { success: false, error: 'Onboarding check failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const status = await performOnboardingCheck();
    const message = getOnboardingMessage(status);

    return NextResponse.json({
      success: true,
      status,
      message,
    });
  } catch (error) {
    console.error('Onboarding check error:', error);
    return NextResponse.json(
      { success: false, error: 'Onboarding check failed' },
      { status: 500 }
    );
  }
}
