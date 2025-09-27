# Audit UX & Material Design 3 – Parcours d'authentification

## Contexte et périmètre
Cet audit couvre l'écran d'authentification multi-onglets (connexion, inscription, mot de passe oublié, renvoi d'email de vérification) implémenté dans `src/views/AuthView.vue`. L'objectif est de vérifier l'alignement avec les bonnes pratiques d'expérience utilisateur et les principes du Material Design 3 (MD3) tout en garantissant un parcours fluide et sécurisé.

## Résumé exécutif
| Priorité | Constats clés | Impacts | Recommandations rapides |
| --- | --- | --- | --- |
| Haute | Absence de hiérarchie claire sur mobile lorsque l'aside décoratif est masqué, ce qui crée un écran très dense avec peu d'espace de respiration. | Charge cognitive élevée, risque d'abandon. | Introduire davantage d'espacements verticaux et de séparateurs visuels, et déplacer la proposition de valeur sous la carte principale plutôt que dans un aside caché. |
| Haute | Les champs de formulaire utilisent un style personnalisé simple sans états "filled"/"outlined" MD3 ni labels flottants. | Incohérence visuelle avec le reste du design système, repères manquants pour les utilisateurs habitués à Material. | Remplacer par un composant Text Field MD3 (filled/outlined) avec label flottant, support d'erreur contextualisé et helper text. |
| Moyenne | Les CTA primaires et secondaires partagent la même couleur de fond (`--md-sys-color-primary`) et la même forme en pill, ce qui brouille la hiérarchie d'action. | Confusion possible entre action principale et action de secours. | Utiliser un ton secondaire pour les actions alternatives (tonalité tertiary/secondary) ou adopter la variante "tonal" MD3. |
| Moyenne | Les retours d'état (messages de succès/erreur) persistent au changement d'onglet et ne sont pas regroupés sous le champ concerné. | Risque de mauvaise attribution de l'erreur et bruit visuel. | Réinitialiser les messages lors du changement d'onglet et afficher les erreurs au plus près du champ en cause. |
| Basse | Les icônes d'actions (visibilité, renvoi d'email) ne disposent pas d'états de survol/focus visibles dans les thèmes à contraste élevé. | Accessibilité limitée pour utilisateurs souris/clavier. | Ajouter des styles `:focus-visible` et `:hover` cohérents avec MD3 (halo ou changement de tonalité). |

## Analyse détaillée par parcours

### Connexion
- **Structure et navigation** : l'onglet "Connexion" est bien identifié grâce au `role="tab"` et au `aria-selected` dynamique.【F:src/views/AuthView.vue†L15-L34】 Cependant, le contraste de l'onglet inactif repose sur la couleur de texte seulement. Prévoir une tonalité de surface ou un indicateur MD3 (barre active) pour renforcer la perception.
- **Champs** : les champs e-mail et mot de passe sont déclarés avec `autocomplete` pertinent et un bouton d'affichage du mot de passe.【F:src/views/AuthView.vue†L95-L129】 En revanche, le label reste statique au-dessus du champ, ce qui ne suit pas la spécification des Text Fields MD3 (label flottant, line ripple, helper text). Adapter la structure DOM (wrapper `md-filled-text-field`) ou réutiliser un composant existant pour profiter des états focus, disabled et error standard.
- **Gestion des erreurs** : les erreurs sont affichées dans un bloc global en haut de formulaire.【F:src/views/AuthView.vue†L69-L94】 MD3 recommande de rapprocher l'erreur du champ concerné (supporting text rouge). Implémenter une distribution par champ quand le back-end retourne un code connu (ex : identifiants invalides) et prévoir un reset des messages lors du passage vers un autre onglet (`switchTab`).
- **CTA** : le bouton principal "Se connecter" adopte une forme pill et réutilise la couleur primaire.【F:src/views/AuthView.vue†L137-L144】 Pour respecter la hiérarchie MD3, on peut :
  - Conserver la forme large (Full width) mais ajouter un `box-shadow` d'élévation niveau 1 et un état `focus-visible` avec halo.
  - Diminuer la largeur et centrer le bouton sur mobile afin de limiter la pression visuelle.
- **Assistance à la vérification e-mail** : le bloc d'avertissement et d'action est pertinent (copie claire, bouton de renvoi, feedback) et respecte l'accessibilité via `aria-live`.【F:src/views/AuthView.vue†L71-L93】 Il gagnerait toutefois à adopter le composant "supporting card" MD3 : fond Tonal, bord arrondi 12 px, icône d'information.

### Inscription
- **Validation progressive** : la check-list de critères de mot de passe réagit en direct, ce qui est positif pour l'UX.【F:src/views/AuthView.vue†L205-L230】 Pour Material, remplacer les puces par des `assist chips` ou des "supporting text" alignés verticalement avec une icône check MD3 (`<span class="material-symbols-rounded">`).
- **Champs optionnels** : le champ "Nom complet" n'est pas marqué comme obligatoire. Clarifier via helper text ou label secondaire.
- **Feedback post-soumission** : aucun écran de confirmation n'informe l'utilisateur qu'un email de vérification est envoyé. Prévoir une page ou un état dédié (banner MD3 "confirmation obligatoire") avant de renvoyer vers l'onglet connexion.
- **Hiérarchie visuelle** : l'ensemble des actions (CTA inscription, toggles de mot de passe, liens) utilisent la même couleur primaire. Introduire la palette secondaire pour différencier les interactions secondaires.

### Renvoi d'email de vérification
- **Déclencheur** : le bouton "Renvoyer l'email" réemploie la même classe que les CTA primaires.【F:src/views/AuthView.vue†L82-L93】 Pour respecter MD3, basculer sur la variante "tonal button" ou "outlined button" (fond `--md-sys-color-secondary-container`, texte `--md-sys-color-on-secondary-container`).
- **Feedback** : les messages de succès/erreur sont affichés sous le bouton, ce qui est conforme aux bonnes pratiques. Ajouter une durée d'auto-masquage ou une fermeture manuelle pour éviter la persistance après navigation.
- **Protection contre le spam** : prévoir un état disabled avec minuterie visible (text supporting) pour indiquer quand une nouvelle demande est possible.

### Mot de passe oublié
- **Clarté du parcours** : le titre et la description explicitent l'action attendue.【F:src/views/AuthView.vue†L263-L296】 En revanche, l'écran ne propose pas de visuel ou d'illustration légère ; sur mobile, cela peut sembler austère.
- **CTA secondaire** : le lien "Retour à la connexion" est aligné à droite, ce qui suit la hiérarchie d'action. Veiller à ajouter `:focus-visible` et `underline` pour l'accessibilité clavier.
- **Confirmation** : après l'envoi, prévoir un état de succès distinct (ex. remplacer le formulaire par un panneau confirmant l'envoi avec un bouton pour ouvrir la boîte mail). Cela réduit l'incertitude.

## Considerations transverses
- **Responsive & densité** : l'aside décoratif disparaît sous 1024 px, mais aucun ajustement additionnel ne redistribue le contenu principal.【F:src/views/AuthView.vue†L671-L1008】 Ajouter des marges extérieures (`margin-inline`) et réduire la largeur du conteneur pour éviter que la carte ne colle aux bords sur petits écrans.
- **Gestes d'accessibilité** : ajouter des états `:focus-visible` sur `.auth-tab`, `.auth-submit`, `.auth-secondary-action`, `.password-toggle` pour respecter le standard MD3 (halo 3 px, animation). Les transitions actuelles n'offrent qu'un léger `transform`.
- **Typographie** : la carte utilise `var(--md-sys-typescale-headline-small-font)` pour le titre, ce qui est conforme.【F:src/views/AuthView.vue†L707-L716】 Assurer que les paragraphes utilisent `body-medium` (`font-size: 1rem` + `line-height: 1.5`).
- **Gestion des messages** : les états `message`/`errorMessage` sont partagés entre onglets via `ref` globaux.【F:src/views/AuthView.vue†L326-L366】 Nettoyer ces refs dans `switchTab` pour éviter d'afficher une erreur de connexion sur l'écran mot de passe oublié.
- **Consistance avec AuthCallback** : l'écran de callback applique déjà une carte MD3 avec iconographie dynamique.【F:src/views/AuthCallbackView.vue†L1-L80】【F:src/views/AuthCallbackView.vue†L87-L156】 S'inspirer de cette structure pour harmoniser les feedbacks entre écrans.

## Recommandations priorisées
1. **Remplacer les champs custom par des Text Fields MD3** (filled ou outlined) avec helper text d'erreur et label flottant.
2. **Revoir la hiérarchie colorimétrique des boutons** en introduisant tonal/outlined pour les actions secondaires (renvoi d'email, lien mot de passe oublié) et en ajoutant des états focus visibles.
3. **Améliorer l'expérience mobile** : réorganiser le contenu en colonne unique, augmenter les marges et proposer un encart de bénéfices sous le formulaire.
4. **Isoler les messages de feedback par onglet** : nettoyer les refs lors du changement d'onglet et positionner les messages sous le champ concerné.
5. **Ajouter un état de confirmation dédié après inscription et après envoi d'email** pour rassurer l'utilisateur (par ex. remonter un `Dialog` ou un `Banner` MD3 avec instructions).

## Étapes suivantes proposées
- Prototyper une version MD3 dans Figma pour valider la hiérarchie visuelle avant implémentation.
- Factoriser un composant `AuthFormLayout` réutilisable pour les différents formulaires, intégrant les variantes de boutons et champs MD3.
- Mettre en place des tests utilisateurs rapides (5 personnes) afin de valider la compréhension des états de vérification et des actions secondaires.
- Documenter les règles de contenu (ton, longueur des messages, actions post-soumission) dans le dossier `/docs` aux côtés de l'audit de sécurité déjà existant.

