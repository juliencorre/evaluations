# Modèles d'e-mails Supabase

Ces modèles HTML permettent de personnaliser les e-mails envoyés par Supabase pour l'authentification (confirmation, lien magique, réinitialisation de mot de passe). Ils respectent la charte graphique de l'application **Évaluations** et utilisent des couleurs contrastées compatibles avec le mode clair/sombre.

## Placeholders disponibles

Supabase remplace automatiquement les variables suivantes lors de l'envoi :

- `{{ .Email }}` : adresse e-mail du destinataire.
- `{{ .ConfirmationURL }}` : lien sécurisé pour confirmer l'inscription ou réinitialiser le mot de passe.
- `{{ .ActionLink }}` : lien utilisé pour les connexions via lien magique.
- `{{ .SiteURL }}` : URL publique du projet.

## Mise en place

1. Dans le tableau de bord Supabase, rendez-vous dans **Authentication → Email Templates**.
2. Copiez-collez le contenu du fichier correspondant :
   - `account-confirmation.html` pour l'e-mail de confirmation d'inscription.
   - `password-reset.html` pour la réinitialisation de mot de passe.
   - `magic-link.html` pour les connexions en un clic.
3. Activez l'option « Custom SMTP » si vous utilisez un serveur d'envoi spécifique.
4. Testez chaque modèle en utilisant la fonctionnalité « Send Test Email » de Supabase.

> 💡 **Astuce sécurité** : gardez la durée de validité des liens la plus courte possible dans Supabase (15 à 60 minutes) et forcez l'ouverture dans un navigateur sécurisé (`rel="noopener"`).

## Bonnes pratiques de maintenance

- Conservez ces fichiers sous contrôle de version afin d'historiser les changements.
- Synchronisez régulièrement les modèles depuis Supabase vers ce dossier après modification côté dashboard.
- Utilisez des formulations inclusives et précises : chaque modèle indique la durée de validité et la marche à suivre en cas d'action non sollicitée.
