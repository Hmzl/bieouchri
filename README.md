# Awani Chawki

Boutique et gestion de magasin (React + Vite), avec base **Turso**. Catalogue, panier, commandes WhatsApp, espace commerçant.

Les produits, commandes et paramètres sont partagés entre tous les appareils via Turso. Le panier reste local au navigateur.

## Connecter Turso à Vercel

L’app lit ces 3 variables **uniquement côté serveur** (ne les préfixez pas par `VITE_`) :

| Variable | Rôle |
|---|---|
| `TURSO_DATABASE_URL` | URL `libsql://…` de la base |
| `TURSO_AUTH_TOKEN` | Jeton d’accès Turso |
| `AUTH_SECRET` | Secret pour les sessions commerçant (12 h) |

### Méthode simple (recommandée)

1. Ouvrez [Turso Cloud pour Vercel](https://vercel.com/marketplace/tursocloud) et installez-le sur le projet **bieouchri**.
2. Cela crée la base et ajoute `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
3. Dans Vercel : **Settings → Environment Variables**, ajoutez aussi `AUTH_SECRET` (une longue chaîne aléatoire).
4. Cochez **Production**, **Preview** et **Development**.
5. **Deployments → … → Redeploy** (sans cache).

### Méthode manuelle

1. Créez une base sur [app.turso.tech](https://app.turso.tech).
2. Copiez l’URL et créez un token.
3. Collez les 3 variables dans Vercel, puis redéployez.

Les tables sont créées automatiquement au premier appel `/api/store`.

Connexion commerçant : **5 secondes** sur le logo, puis `awani` / `chawki`.

## En local

```powershell
copy .env.example .env
```

Remplissez `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` et `AUTH_SECRET`, puis :

```bash
npm install
npm run init-db
npm run dev
```

`npm run init-db` crée les tables Turso (et un catalogue d’exemple avec `npm run init-db -- --demo`).
