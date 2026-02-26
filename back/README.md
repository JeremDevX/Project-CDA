# Back Template - Auth API

Template backend prêt à développer avec :

- `Express` + `TypeScript`
- `JWT` (login/logout + route protégée)
- `SQLite` + `Prisma`
- endpoints auth de base (`register`, `login`, `me`, `change-password`, `logout`)
- `ESLint` + `Vitest` (test HTTP minimal inclus)

## Démarrage

1. Copier l'environnement :
   - `cp .env.example .env`
2. Installer les dépendances :
   - `npm install`
3. Créer/mettre à jour le schéma SQLite :
   - `npm run prisma:push`
4. Lancer en dev :
   - `npm run dev`

API par défaut : `http://localhost:1337/api`

## Scripts

- `npm run dev` : compile en watch + relance Node
- `npm run build` : compile TypeScript vers `dist`
- `npm run lint` : lint du code backend
- `npm run test` : lance `Vitest` en watch
- `npm run test:run` : lance les tests une fois
- `npm run prisma:generate` : génère Prisma Client
- `npm run prisma:push` : crée/met à jour la DB SQLite depuis `prisma/schema.prisma`
- `npm start` : lance l'API compilée

## Structure

- `src/index.ts` : bootstrap serveur
- `src/app.ts` : app Express
- `prisma/schema.prisma` : schéma Prisma
- `src/database.ts` : client Prisma
- `src/router/auth.ts` : routes d'authentification
- `src/middlewares/requireAuth.ts` : protection JWT
- `test/health.test.ts` : test HTTP minimal (`/api/health`)

## Requêtes d'exemple

Le fichier `src/requests.http` contient un scénario de test manuel des endpoints auth du template.
