# Support de la valeur "N/A" (Non Applicable)

## Vue d'ensemble

L'application supporte maintenant la valeur "**N/A**" (Non Applicable) pour tous les types de résultats. Cette fonctionnalité permet d'indiquer qu'une compétence n'a pas pu être évaluée pour un élève donné, et ces résultats sont automatiquement exclus des calculs de moyennes.

## Fonctionnement

### 1. Sélection de N/A
- **Disponible pour tous les types de résultats** : Échelle A-E, Oui/Non, Acquis/En cours/Non acquis, et types personnalisés
- **Interface utilisateur** : Option clairement identifiée avec une barre grise dans le sélecteur
- **Libellé** : "Non applicable" ou "Non évalué"

### 2. Exclusion des calculs
Lorsqu'un résultat est marqué comme "N/A" :
- Il n'est **PAS comptabilisé** dans les moyennes
- Il n'affecte **PAS** les pourcentages de réussite
- Il n'apparaît **PAS** dans les graphiques de performance

### 3. Exemple de calcul

#### Scénario : 3 sous-compétences évaluées
- Sous-compétence 1 : **Oui** (10/10)
- Sous-compétence 2 : **Oui** (10/10)
- Sous-compétence 3 : **N/A** (non comptabilisé)

**Résultat** : 10/10 (moyenne des 2 compétences évaluées)

#### Sans N/A (ancien comportement)
- La moyenne aurait été : (10 + 10 + 0) / 3 = 6.67/10

#### Avec N/A (nouveau comportement)
- La moyenne est : (10 + 10) / 2 = 10/10

## Implémentation technique

### Base de données
```sql
-- Les valeurs N/A ont un pivot_value NULL
{
  "value": "N/A",
  "label": "Non applicable",
  "pivot_value": null
}
```

### TypeScript
```typescript
// La fonction getScoreFromValue retourne null pour N/A
const getScoreFromValue = (value: string): number | null => {
  if (value === 'N/A') return null
  // ...
}

// Les calculs filtrent les valeurs null
const scores = results
  .map(r => getScoreFromValue(r.value))
  .filter(score => score !== null) as number[]

const average = scores.length > 0
  ? scores.reduce((sum, s) => sum + s, 0) / scores.length
  : 0
```

### Composants Vue
```vue
<!-- InlineResultSelector affiche N/A avec style approprié -->
<button class="select-option level-n-a">
  <span>N/A - Non applicable</span>
</button>
```

## Cas d'usage

### Quand utiliser N/A ?

1. **Absence justifiée** : L'élève était absent lors de l'évaluation
2. **Compétence non pertinente** : La compétence n'est pas applicable à cet élève
3. **Évaluation reportée** : L'évaluation sera faite ultérieurement
4. **Conditions inadéquates** : Les conditions ne permettaient pas une évaluation juste

### Avantages

- **Précision des moyennes** : Les moyennes reflètent uniquement les compétences réellement évaluées
- **Flexibilité** : Permet de gérer les cas particuliers sans fausser les statistiques
- **Transparence** : Distinction claire entre "non acquis" (0/10) et "non évalué" (N/A)

## Migration des données existantes

Pour appliquer les changements à une base existante :

```bash
# Exécuter la migration
supabase migration up 013_add_na_support.sql
```

Cette migration :
- Ajoute N/A à tous les types de résultats existants
- Configure le pivot_value à NULL pour N/A
- Crée une fonction SQL pour les calculs excluant N/A

## Interface utilisateur

### Sélecteur de résultats
![Style N/A]
- **Couleur** : Gris (--md-sys-color-outline)
- **Indicateur** : Barre latérale grise
- **Texte** : "N/A - Non applicable"

### Tableaux d'évaluation
- Les cellules N/A sont affichées avec un fond gris clair
- Le texte est en italique pour indiquer l'absence d'évaluation

### Graphiques
- Les résultats N/A sont exclus des graphiques
- La légende indique le nombre de compétences évaluées vs total

## Tests

### Scénarios de test

1. **Calcul avec N/A uniquement**
   - Toutes les compétences à N/A → Moyenne = 0 (aucune donnée)

2. **Calcul mixte**
   - Mix de valeurs et N/A → Moyenne des valeurs non-N/A

3. **Export PDF**
   - Les N/A apparaissent dans les exports mais n'affectent pas les moyennes

4. **Filtres et recherches**
   - Possibilité de filtrer les élèves avec des N/A

## FAQ

**Q : Est-ce que N/A compte comme un échec ?**
R : Non, N/A n'est pas comptabilisé du tout. C'est différent d'un échec (0/10).

**Q : Peut-on changer un N/A après coup ?**
R : Oui, vous pouvez modifier un N/A en sélectionnant une autre valeur à tout moment.

**Q : Comment distinguer visuellement N/A des autres résultats ?**
R : N/A a une apparence grise distincte dans l'interface, contrairement aux couleurs vives des autres résultats.

**Q : Les N/A apparaissent-ils dans les bulletins ?**
R : Oui, mais ils sont clairement identifiés comme "Non évalué" et n'affectent pas les moyennes affichées.