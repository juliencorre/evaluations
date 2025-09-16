import fs from 'fs';

// Lire le fichier store
let content = fs.readFileSync('src/stores/studentsStore.ts', 'utf8');

// Remplacer tous les fallbacks locaux par des erreurs
const replacements = [
  // Remplacer les conditions de désactivation Supabase
  {
    from: /if \(!useSupabaseCompetencies\.value\) \{[\s\S]*?return[^}]*\}/g,
    to: `if (!useSupabaseCompetencies.value) {
      console.error('❌ [Store] Supabase désactivé - opération impossible')
      throw new Error('Supabase indisponible')
    }`
  },
  // Remplacer les fallbacks dans les catch
  {
    from: /\/\/ Fallback:[\s\S]*?return[^}]*}/g,
    to: 'throw err // Pas de fallback statique'
  }
];

replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Écrire le fichier modifié
fs.writeFileSync('src/stores/studentsStore.ts', content);
console.log('✅ Fallbacks statiques supprimés');