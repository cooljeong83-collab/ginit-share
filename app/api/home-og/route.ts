import { NextResponse } from 'next/server';

/** 예전 `?lang=` URL 호환 — `/api/home-og/en` 등으로 리다이렉트 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang')?.trim() || 'ko';
  const target = new URL(`/api/home-og/${lang}`, request.url);
  return NextResponse.redirect(target, 307);
}
