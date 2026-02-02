# OpenClaw — Tastytrade Agentic Trading Bot

Milestone 1 delivery for Errol Pierre Davi. Headless, Dockerized AI trading agent connected to the Tastytrade sandbox API on a hardened Ubuntu 24.04 VPS.

---

## Infrastructure

| Component | Details |
|---|---|
| VPS | Ubuntu 24.04.3 LTS — 178.105.44.154 |
| Firewall | UFW (SSH only) + Fail2Ban |
| Runtime | Node.js 22 (Docker) |
| Containers | openclaw-executor, openclaw-critic |
| Broker | Tastytrade (cert sandbox) |
| Auto-restart | Docker restart: always |

---

## Project Structure

```
openclaw/
├── agent.js                  # Core agent — auth, heartbeat, memory-wiki logging
├── Dockerfile                # Node.js 22 slim image
├── docker-compose.yml        # Executor + Critic isolated services
├── package.json
├── executor/
│   └── agents.json           # Executor config — trade permissions, Greek subscriptions
├── critic/
│   └── agents.json           # Critic config — risk limits, validation rules
├── skills/
│   └── gamma_scalp/
│       ├── config.json       # Phase 2 skeleton — delta threshold, hedge interval
│       ├── soul.md           # Drop client Soul file here to activate
│       └── risk.md           # Drop client Risk file here to activate
└── memory-wiki/
    └── trades.jsonl          # Live heartbeat + trade log (JSON-Lines)
```

---

## Green Heartbeat — Milestone 1 Proof

Session authenticated and heartbeat confirmed GREEN on **2026-04-23 at 18:31 UTC**.
Logging every 60 seconds to `memory-wiki/trades.jsonl`.

### Auth confirmation
```json
{"timestamp":"2026-04-23T18:31:07.069Z","role":"executor","msg":"auth","status":"GREEN","user":"errolpd2@yahoo.co.uk","username":"nadir369","confirmed":true,"broker":"tastytrade","mode":"sandbox/cert"}
```

### Live heartbeat log (sample — 25 minutes of uptime)
```json
{"timestamp":"2026-04-23T18:31:07.206Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:32:07.247Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:33:07.291Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:34:07.321Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:35:07.379Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:36:07.440Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:37:07.484Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:38:07.530Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:39:07.551Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:40:07.588Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:41:07.628Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:42:07.648Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:43:07.672Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:44:07.696Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:45:07.720Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:46:07.776Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:47:07.836Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:48:07.892Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:49:07.915Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:50:07.935Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:51:07.978Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:52:08.038Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:53:08.044Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:54:08.104Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:55:08.141Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
{"timestamp":"2026-04-23T18:56:08.165Z","role":"executor","msg":"heartbeat","status":"GREEN","broker":"tastytrade","session":"ACTIVE","mode":"sandbox/cert"}
```

---

## Docker Container Status

Both containers running with `restart: always` — auto-recover on any crash.

```
NAME                IMAGE               STATUS
openclaw-executor   openclaw:2026.4.7   Up
openclaw-critic     openclaw:2026.4.7   Up
```

---

## Security

- UFW: deny all incoming except SSH (port 22)
- Fail2Ban: SSH brute-force protection (ban after 3 attempts)
- SSH: MaxAuthTries 5, password auth only (key auth recommended for M2)
- No withdrawal permissions on broker API

---

## Phase 2 — Gamma Scalp Skill (Plug-and-Play)

The `skills/gamma_scalp/` folder is pre-wired. To activate:

1. Replace `soul.md` with your Soul definition
2. Replace `risk.md` with your Risk definition
3. Set `"enabled": true` in `skills/gamma_scalp/config.json`
4. Run `docker compose restart` on the VPS

Current config skeleton:
```json
{
  "skill": "gamma_scalp",
  "enabled": false,
  "delta_threshold": 0.05,
  "gamma_target": 0.0,
  "hedge_interval_seconds": 60,
  "expiration_ladder": ["front", "second"],
  "strikes": "atm_plus_minus_2"
}
```

---

## VPS Commands

```bash
# Check container status
docker compose -f /root/openclaw/docker-compose.yml ps

# Live logs
docker logs openclaw-executor -f

# Memory-wiki tail
tail -f /root/openclaw/memory-wiki/trades.jsonl

# Restart agents
docker compose -f /root/openclaw/docker-compose.yml restart
```
<!-- updated: 2026-02-02-02 -->
