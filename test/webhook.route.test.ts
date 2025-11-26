import { NextRequest } from 'next/server';
import * as webhookRoute from '../app/api/webhook/route';

const makeJsonRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/webhook', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });

describe('api/webhook', () => {
  it('GET returns ok', async () => {
    const res = await webhookRoute.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('POST returns success for valid JSON', async () => {
    const req = makeJsonRequest({ hello: 'world' });
    const res = await webhookRoute.POST(req as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('POST returns 500 on invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/webhook', { method: 'POST', body: '{bad json', headers: new Headers({ 'Content-Type': 'application/json' }) });
    const res = await webhookRoute.POST(req as NextRequest);
    expect(res.status).toBe(500);
  });
});

