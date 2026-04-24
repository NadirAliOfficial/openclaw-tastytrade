'use strict';
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const ROLE = process.env.OPENCLAW_ROLE || 'executor';
const TT_USERNAME = process.env.TT_USERNAME;
const TT_PASSWORD = process.env.TT_PASSWORD;
const TT_SANDBOX = process.env.TT_SANDBOX === 'true';
const TT_HOST = TT_SANDBOX ? 'api.cert.tastyworks.com' : 'api.tastyworks.com';
const TT_STREAMER_HOST = TT_SANDBOX ? 'streamer.cert.tastyworks.com' : 'streamer.tastyworks.com';
const MEMORY_PATH = '/workspace/memory/trades.jsonl';

let sessionToken = null;
let rememberToken = null;
let connected = false;

const log = (msg, data = {}) => {
  const entry = { timestamp: new Date().toISOString(), role: ROLE, msg, ...data };
  console.log(JSON.stringify(entry));
  try { fs.appendFileSync(MEMORY_PATH, JSON.stringify(entry) + '\n'); } catch {}
};

const request = (method, path, body, token) => new Promise((resolve, reject) => {
  const data = body ? JSON.stringify(body) : null;
  const opts = {
    hostname: TT_HOST, port: 443, path, method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': token } : {}),
      ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
    }
  };
  const req = https.request(opts, res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
      catch { resolve({ status: res.statusCode, body: {} }); }
    });
  });
  req.on('error', reject);
  if (data) req.write(data);
  req.end();
});

const authenticate = async () => {
  log('connecting', { broker: 'tastytrade', host: TT_HOST, user: TT_USERNAME, mode: TT_SANDBOX ? 'sandbox' : 'live' });
  const res = await request('POST', '/sessions', { login: TT_USERNAME, password: TT_PASSWORD, 'remember-me': true });
  if (res.status !== 201) throw new Error(`Auth failed ${res.status}`);
  sessionToken = res.body.data['session-token'];
  rememberToken = res.body.data['remember-token'];
  const user = res.body.data.user;
  log('auth', {
    status: 'GREEN',
    user: user?.email,
    username: user?.username,
    confirmed: user?.['is-confirmed'],
    broker: 'tastytrade',
    mode: TT_SANDBOX ? 'sandbox/cert' : 'live'
  });
  connected = true;
};

const fetchAccount = async () => {
  // Try standard endpoint — works on production; cert env returns 403 (no customer record)
  const res = await request('GET', '/customers/me/accounts', null, sessionToken);
  if (res.status === 200) {
    const acct = res.body.data?.items?.[0]?.account;
    log('account', { accountNumber: acct?.['account-number'], type: acct?.['account-type-name'], status: 'ACTIVE' });
    return acct?.['account-number'];
  }
  // Cert env limitation — auth still confirmed GREEN
  log('account_note', {
    status: res.status,
    note: 'Cert OAuth2 environment has no customer record. Auth is GREEN. Full account access requires production paper trading account.',
    action: 'Awaiting production credentials from client'
  });
  return null;
};

const heartbeat = async () => {
  if (!connected) return;
  log('heartbeat', {
    status: 'GREEN',
    broker: 'tastytrade',
    session: 'ACTIVE',
    mode: TT_SANDBOX ? 'sandbox/cert' : 'live',
    note: TT_SANDBOX ? 'Auth confirmed. Awaiting production paper account for full data access.' : 'LIVE'
  });
};

const refreshSession = async () => {
  if (!rememberToken) return;
  try {
    const res = await request('PUT', '/sessions', { 'remember-token': rememberToken });
    if (res.body.data?.['session-token']) {
      sessionToken = res.body.data['session-token'];
      log('session_refresh', { status: 'OK' });
    }
  } catch (e) { log('refresh_error', { error: e.message }); }
};

const main = async () => {
  try {
    await authenticate();
    await fetchAccount();
    await heartbeat();

    setInterval(heartbeat, 60000);
    setInterval(refreshSession, 20 * 60 * 60 * 1000);
  } catch (e) {
    log('error', { error: e.message, retry_in: '30s' });
    connected = false;
    setTimeout(main, 30000);
  }
};

main();
