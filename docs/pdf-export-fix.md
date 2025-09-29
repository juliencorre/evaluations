# Correction de l'Export PDF des Graphiques

## Problème résolu
Les graphiques étaient tronqués lors de l'export en PDF. Seule une partie du graphique était visible dans le document généré.

## Cause du problème
1. Les dimensions du canvas n'étaient pas correctement calculées avec `html2canvas`
2. Le ratio d'aspect n'était pas préservé lors du redimensionnement
3. Aucune vérification de la hauteur maximale disponible sur la page PDF

## Solution implémentée

### Améliorations apportées dans 3 fichiers :

#### 1. `DashboardView.vue` - Export des moyennes de classe
- Ajout des options `windowWidth`, `windowHeight`, `width` et `height` dans html2canvas
- Calcul dynamique des dimensions maximales disponibles sur la page
- Ajustement automatique si le graphique est trop grand
- Centrage horizontal du graphique dans le PDF

#### 2. `AnalysisView.vue` - Export des analyses individuelles
- Mêmes améliorations que pour DashboardView
- Gestion optimisée pour l'export de plusieurs graphiques
- Limitation à 2 graphiques par page pour éviter le chevauchement

### Code optimisé pour html2canvas :
```javascript
const canvas = await html2canvas(chartElement, {
  backgroundColor: '#ffffff',
  scale: 2,
  useCORS: true,
  logging: false,
  windowWidth: chartElement.scrollWidth,
  windowHeight: chartElement.scrollHeight,
  width: chartElement.scrollWidth,
  height: chartElement.scrollHeight
})
```

### Calcul des dimensions optimales :
```javascript
// Dimensions maximales disponibles
const maxWidth = pageWidth - (margin * 2)
const maxHeight = pageHeight - 60 // Espace pour titre et infos

// Calculer les dimensions en gardant le ratio
let imgWidth = maxWidth
let imgHeight = (canvas.height * imgWidth) / canvas.width

// Ajuster si trop haut
if (imgHeight > maxHeight) {
  imgHeight = maxHeight
  imgWidth = (canvas.width * imgHeight) / canvas.height
}

// Centrer l'image
const xPosition = margin + (maxWidth - imgWidth) / 2
```

## Résultat
- ✅ Les graphiques sont maintenant entièrement visibles dans le PDF
- ✅ Le ratio d'aspect est préservé
- ✅ Les graphiques sont centrés horizontalement
- ✅ La qualité d'image est maintenue avec scale: 2
- ✅ Support des graphiques de toutes tailles

## Test
Pour tester l'export PDF :
1. Aller dans la vue Analyse
2. Sélectionner un graphique (moyennes de classe ou analyse élève)
3. Cliquer sur le bouton "Exporter"
4. Vérifier que le PDF contient le graphique complet

## Compatibilité
- Compatible avec tous les navigateurs modernes
- Fonctionne avec jsPDF et html2canvas
- Format A4 paysage optimisé pour les graphiques