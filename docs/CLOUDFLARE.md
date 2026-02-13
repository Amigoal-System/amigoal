# Amigoal - Cloudflare Konfiguration

## DNS-Einstellungen

### 1. Domain hinzufügen
- Füge deine Domain (z.B. `amigoal.app`) zu Cloudflare hinzu

### 2. DNS Records
Erstelle folgende DNS-Einträge:

| Type | Name | Value | Proxy Status |
|------|------|-------|---------------|
| CNAME | @ |firebase-app-hosting[deine-id].web.app | Proxied |
| CNAME | www | firebase-app-hosting[deine-id].web.app | Proxied |

---

## SSL/TLS

### Encryption Mode
- **Full (Strict)** - Empfohlen

### Edge Certificates
- **Automatic HTTPS Rewrites** - Aktivieren
- **TLS 1.3** - Aktivieren

---

## Page Rules (optional)

Falls du spezielle Routing-Regeln benötigst:

1. **Super-Admin Login:**
   - Pattern: `amigoal.app/*/saas-superlogin/*`
   - Settings: Cache Level: Bypass

2. **Statische Assets:**
   - Pattern: `amigoal.app/*/images/*`
   - Settings: Cache Level: Cache Everything

---

## Firewall (optional)

### Rate Limiting
Für den Login-Schutz kannst du Rate Limiting aktivieren:
- **Login Attempts:** Max 5 Versuche pro Minute

---

## Performance

### Speed
- **Auto Minify:** JavaScript, CSS, HTML aktivieren
- **Brotli:** Aktivieren
- **Rocket Loader:** Deaktivieren (kann React beeinträchtigen)

---

## Wichtig

1. **Authentifizierung:** Firebase Auth wird verwendet
2. **Session Cookie:** Wird automatisch gesetzt
3. **Middleware:** Bereits konfiguriert für i18n und Subdomains
