# Evaluations - Plateforme d'Évaluation Sécurisée

Une application moderne de gestion d'évaluations avec authentification sécurisée via Supabase, construite avec Nuxt 3.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase
- **Interface moderne** avec TailwindCSS et Headless UI
- **Validation de formulaires** robuste avec vee-validate
- **Conformité RGPD** avec politique de confidentialité complète
- **Design responsive** et accessible
- **Tests automatisés** avec couverture de code
- **Configuration sécurisée** via variables d'environnement

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
# Obtenez ces valeurs depuis votre dashboard Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

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
│   ├── layouts/             # Layouts de l'application
│   ├── middleware/          # Middlewares de route
│   ├── pages/               # Pages de l'application
│   │   ├── index.vue        # Page d'accueil
│   │   ├── login.vue        # Page de connexion
│   │   ├── register.vue     # Page d'inscription
│   │   ├── privacy.vue      # Politique de confidentialité
│   │   └── terms.vue        # Conditions d'utilisation
│   └── app.vue              # Composant racine
├── composables/             # Composables Vue
│   ├── useAuth.ts          # Gestion de l'authentification
│   └── useSupabase.ts      # Client Supabase
├── test/                   # Tests automatisés
├── nuxt.config.ts         # Configuration Nuxt
├── vitest.config.ts       # Configuration des tests
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
# Variables publiques (exposées côté client)
SUPABASE_URL=              # URL de votre projet Supabase
SUPABASE_ANON_KEY=         # Clé publique Supabase

# Variables privées (serveur uniquement)
SUPABASE_SERVICE_KEY=      # Clé de service Supabase (admin)
```

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
  user,           // Utilisateur connecté
  isLoggedIn,     // État de connexion
  loading,        // État de chargement
  register,       // Fonction d'inscription
  login,          // Fonction de connexion
  logout,         // Fonction de déconnexion
  resetPassword,  // Réinitialisation mot de passe
  initAuth        // Initialisation de l'auth
} = useAuth()
```

### useSupabase() - Client Supabase
```typescript
const supabase = useSupabase()
// Client Supabase configuré et prêt à l'emploi
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

const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
})

const { handleSubmit, errors } = useForm({ validationSchema: schema })
</script>
```

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
