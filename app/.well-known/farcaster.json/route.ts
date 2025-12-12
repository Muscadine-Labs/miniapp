import { NextResponse } from 'next/server';
// @ts-ignore - minikit-config re-exports from root, path resolution works at runtime
import { minikitConfig } from '../../../minikit.config';

export const revalidate = 3600;

export async function GET() {
  try {
    return NextResponse.json(minikitConfig);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load MiniApp manifest:', error);
    }
    return NextResponse.json(
      { error: 'MANIFEST_UNAVAILABLE' },
      { status: 500 }
    );
  }
}
