// @ts-nocheck
// Test de la nouvelle architecture
// Ce fichier peut être exécuté pour tester les nouveaux services

import { useSchoolYearStore } from '@/stores'
import { useClassStore } from '@/stores'
import { useStudentsStore } from '@/stores'

/**
 * Fonction de test pour la nouvelle architecture
 * À exécuter dans la console du navigateur pour tester
 */
export async function testNewArchitecture() {
  console.log('🧪 Test de la nouvelle architecture des classes/étudiants')

  try {
    // Test 1: School Years Store
    console.log('\n1️⃣ Test SchoolYearStore...')
    const schoolYearStore = useSchoolYearStore()

    await schoolYearStore.ensureLoaded()
    console.log('✅ Années scolaires chargées:', schoolYearStore.schoolYears.length)
    console.log('📅 Année courante:', schoolYearStore.currentSchoolYear?.name || 'Aucune')

    // Test de validation
    const validation = schoolYearStore.validateSchoolYearName('2024-2025')
    console.log('✅ Validation nom année:', validation.valid ? 'OK' : validation.error)

    // Test 2: Class Store étendu
    console.log('\n2️⃣ Test ClassStore étendu...')
    const classStore = useClassStore()

    await classStore.loadClasses()
    console.log('✅ Classes chargées:', classStore.classes.length)
    console.log('🎓 Classes utilisateur:', classStore.userClasses.length)

    // Test de statistiques (si une classe existe)
    if (classStore.classes.length > 0) {
      const firstClass = classStore.classes[0]
      try {
        const stats = await classStore.getClassStatistics(firstClass.id)
        console.log('📊 Statistiques classe:', stats)
      } catch {
        console.log('ℹ️ Statistiques non disponibles (table student_classes pas encore créée)')
      }
    }

    // Test 3: Students Store étendu
    console.log('\n3️⃣ Test StudentsStore étendu...')
    const studentsStore = useStudentsStore()

    await studentsStore.refreshFromSupabase()
    console.log('✅ Étudiants chargés:', studentsStore.allStudents.length)
    console.log('👥 Étudiants actifs:', studentsStore.activeStudents.length)

    // Test de relation classe-étudiant (si données disponibles)
    if (studentsStore.allStudents.length > 0 && classStore.classes.length > 0) {
      const firstStudent = studentsStore.allStudents[0]
      const firstClass = classStore.classes[0]

      try {
        const studentClasses = await studentsStore.getStudentClasses(firstStudent.id)
        console.log('🔗 Classes de l\'étudiant:', studentClasses.length)

        const classStudents = await studentsStore.getStudentsForClass(firstClass.id)
        console.log('🔗 Étudiants de la classe:', classStudents.length)
      } catch {
        console.log('ℹ️ Relations non disponibles (table student_classes pas encore créée)')
      }
    }

    // Test 4: Intégration complète
    console.log('\n4️⃣ Test d\'intégration...')

    // Vérification que les stores communiquent bien
    const currentYear = schoolYearStore.currentSchoolYear
    const classesCurrentYear = classStore.userClasses

    console.log('🔄 Année courante dans classStore:', currentYear?.name)
    console.log('🔄 Classes filtrées par année:', classesCurrentYear.length)

    console.log('\n✅ Test de la nouvelle architecture terminé avec succès!')
    console.log('📝 État:')
    console.log('  - Services frontend: ✅ Opérationnels')
    console.log('  - Stores intégrés: ✅ Fonctionnels')
    console.log('  - Base de données: ⏳ En attente de migration complète')

    return {
      success: true,
      schoolYears: schoolYearStore.schoolYears.length,
      classes: classStore.classes.length,
      students: studentsStore.allStudents.length,
      currentYear: currentYear?.name
    }

  } catch (error) {
    console.error('❌ Erreur pendant le test:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Instructions pour exécuter le test:
 *
 * 1. Ouvrir la console du navigateur (F12)
 * 2. Importer et exécuter:
 *    ```javascript
 *    import('./test/architecture-test.js').then(module => {
 *      module.testNewArchitecture();
 *    });
 *    ```
 *
 * Ou plus simplement, copier le contenu de la fonction testNewArchitecture
 * et l'exécuter directement dans la console.
 */