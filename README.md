# Evaluations - Plateforme d'Évaluation Sécurisée

Une application moderne de gestion d'évaluations avec authentification sécurisée via Supabase, construite avec Nuxt 3.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase
  - Inscription avec validation d'email
  - Connexion avec récupération de mot de passe
  - Protection par middleware des routes privées
  - Templates d'emails modernes et responsive
- **Interface moderne** avec TailwindCSS et Headless UI
  - Design cohérent avec gradient violet/bleu
  - Composants accessibles avec ARIA
  - Navigation responsive et intuitive
- **Validation de formulaires** robuste avec vee-validate
  - Schémas de validation avec Yup
  - Messages d'erreur en français
  - Indicateur de force des mots de passe
  - Rate limiting côté client
- **Conformité RGPD** avec politique de confidentialité complète
- **Sécurité renforcée**
  - Headers de sécurité (CSP, HSTS, etc.)
  - Validation des variables d'environnement
  - Gestion centralisée des erreurs
- **Tests automatisés** avec couverture de code
- **Configuration TypeScript stricte**

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase (https://supabase.io)

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd evaluations
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créez un fichier `.env` basé sur `.env.example`:
```bash
cp .env.example .env
```

Remplissez les variables Supabase dans le fichier `.env`:
```env
# Configuration Supabase - Obtenez ces valeurs depuis votre dashboard Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
```

> **Note**: Utilisez uniquement `SUPABASE_URL` et `SUPABASE_KEY` (clé anonyme). La clé de service n'est pas nécessaire pour l'authentification client.

4. **Configuration de la base de données Supabase**

Dans votre dashboard Supabase, créez les tables nécessaires:

```sql
-- Activer l'authentification par email
-- Cette table est automatiquement créée par Supabase Auth

-- Optionnel: Table pour les profils utilisateur étendus
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politique de sécurité pour les profils
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🚦 Démarrage

### Développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

### Production
```bash
# Build de production
npm run build

# Aperçu local
npm run preview

# Ou démarrer le serveur de production
node .output/server/index.mjs
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Tests avec couverture de code
npm run test:coverage

# Tests en mode watch
npm run test -- --watch
```

## 📁 Structure du projet

```
├── app/
│   ├── assets/css/          # Styles CSS et TailwindCSS
│   ├── components/          # Composants Vue réutilisables
│   ├── layouts/             # Layouts de l'application
│   ├── middleware/          # Middlewares de route (auth.ts)
│   ├── pages/               # Pages de l'application
│   │   ├── index.vue        # Page d'accueil
│   │   ├── login.vue        # Page de connexion
│   │   ├── register.vue     # Page d'inscription
│   │   ├── privacy.vue      # Politique de confidentialité
│   │   └── terms.vue        # Conditions d'utilisation
│   └── app.vue              # Composant racine
├── composables/             # Composables Vue
│   ├── useAuth.ts          # Gestion de l'authentification (singleton)
│   ├── useSupabase.ts      # Client Supabase (singleton)
│   └── useRateLimit.ts     # Rate limiting côté client
├── templates/              # Templates d'emails
│   └── email-confirmation.html # Template de confirmation d'inscription
├── utils/                  # Utilitaires
│   └── errorMessages.ts    # Messages d'erreur centralisés
├── test/                   # Tests automatisés
├── nuxt.config.ts         # Configuration Nuxt avec sécurité
├── vitest.config.ts       # Configuration des tests
├── CLAUDE.md              # Guide pour les développeurs IA
└── README.md              # Documentation
```

## 🔐 Sécurité

### Authentification
- Mots de passe chiffrés par Supabase
- Validation côté client et serveur
- Protection CSRF intégrée
- Sessions sécurisées avec auto-refresh

### RGPD
- Politique de confidentialité complète
- Consentement marketing explicite
- Droit d'accès, rectification et suppression
- Cookies essentiels uniquement par défaut

### Variables d'environnement
```env
# Configuration Supabase (obligatoire)
SUPABASE_URL=              # URL de votre projet Supabase
SUPABASE_KEY=              # Clé anonyme Supabase (publique)
```

> **Sécurité**: Les variables sont validées au démarrage. L'application ne démarrera pas si elles sont manquantes.

## 📱 Pages disponibles

- **`/`** - Page d'accueil avec état d'authentification
- **`/login`** - Connexion avec récupération de mot de passe
- **`/register`** - Inscription avec validation robuste
- **`/privacy`** - Politique de confidentialité RGPD
- **`/terms`** - Conditions d'utilisation

## 🎨 Composants d'authentification

### useAuth() - Composable d'authentification
```typescript
const { 
  user,           // Utilisateur connecté (readonly)
  isLoggedIn,     // État de connexion (computed)
  loading,        // État de chargement (readonly)
  userProfile,    // Métadonnées utilisateur (computed)
  register,       // Fonction d'inscription
  login,          // Fonction de connexion
  logout,         // Fonction de déconnexion
  resetPassword,  // Réinitialisation mot de passe
  updatePassword, // Mise à jour du mot de passe
  initAuth        // Initialisation de l'auth
} = useAuth()
```

> **Pattern Singleton**: `useAuth()` utilise un état global partagé pour éviter les instances multiples.

### useSupabase() - Client Supabase
```typescript
const supabase = useSupabase()
// Client Supabase configuré et prêt à l'emploi
// Pattern singleton avec validation des variables d'environnement
```

## 🛡️ Middleware de protection

Utilisez le middleware `auth` pour protéger les pages:

```vue
<!-- pages/protected.vue -->
<script setup>
// Redirige vers /login si non connecté
definePageMeta({
  middleware: 'auth'
})
</script>
```

## 📊 Validation des formulaires

Les formulaires utilisent vee-validate avec yup pour une validation robuste:

```vue
<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

// Schéma de validation
const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
      'Mot de passe complexe requis')
})

// Liaison des champs avec defineField
const { handleSubmit, errors, defineField } = useForm({ validationSchema: schema })
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
</script>

<template>
  <form @submit="handleSubmit(onSubmit)">
    <input v-model="email" v-bind="emailAttrs" type="email" />
    <input v-model="password" v-bind="passwordAttrs" type="password" />
  </form>
</template>
```

## 📧 Templates d'emails

Le projet inclut un template d'email moderne pour la confirmation d'inscription :

- **Localisation** : `templates/email-confirmation.html`
- **Design** : Moderne avec gradient cohérent avec l'interface
- **Responsive** : Optimisé pour tous les clients email
- **Accessibilité** : ARIA labels et contrastes respectés

Pour configurer dans Supabase :
1. Copiez le contenu de `templates/email-confirmation.html`
2. Dashboard Supabase → Authentication → Email Templates → Confirm signup
3. Remplacez le template par défaut

## 🌐 Déploiement

### Vercel (recommandé pour Nuxt)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement sur vercel.com
```

### Netlify
```bash
# Build
npm run build

# Deploy le dossier .output/public
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation Nuxt**: https://nuxt.com/docs
- **Documentation Supabase**: https://supabase.io/docs
- **Documentation TailwindCSS**: https://tailwindcss.com/docs

Pour toute question ou problème, ouvrez une issue sur GitHub.
