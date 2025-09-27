# 📖 Guide d'Utilisation - Nouvelle Architecture

## 🎯 Vue d'Ensemble

Ce guide explique comment utiliser la nouvelle architecture many-to-many avec gestion des années scolaires.

---

## 🏗️ Concepts Clés

### **1. Années Scolaires (School Years)**
- **Centralisées** dans une table dédiée
- **Format validé** : `YYYY-YYYY` (ex: "2024-2025")
- **Une seule année courante** à la fois
- **Contraintes temporelles** (date fin > date début)

### **2. Relations Étudiants-Classes**
- **Many-to-Many** via `student_classes`
- **Temporelles** : liées à une année scolaire
- **Statuts** : active, transferred, graduated, dropped
- **Historique complet** des inscriptions

### **3. Relations Enseignants-Classes**
- **Étendues** avec `school_year_id`
- **Temporelles** : un enseignant peut enseigner la même classe sur plusieurs années
- **Roles** : teacher, assistant, admin

---

## 🛠️ Utilisation des Services

### **SchoolYearStore**

```typescript
import { useSchoolYearStore } from '@/stores/schoolYearStore'

const schoolYearStore = useSchoolYearStore()

// Charger les données (automatique)
await schoolYearStore.ensureLoaded()

// Accéder aux données
const currentYear = schoolYearStore.currentSchoolYear
const allYears = schoolYearStore.schoolYears
const sortedYears = schoolYearStore.sortedSchoolYears

// Créer une nouvelle année
const newYear = await schoolYearStore.createSchoolYear({
  name: "2025-2026",
  start_date: "2025-09-01",
  end_date: "2026-08-31",
  is_current: false
})

// Définir comme année courante
await schoolYearStore.setCurrentSchoolYear("2025-2026")

// Validation
const validation = schoolYearStore.validateSchoolYearName("2024-2025")
if (!validation.valid) {
  console.error(validation.error)
}
```

### **ClassStore Étendu**

```typescript
import { useClassStore } from '@/stores/classStore'

const classStore = useClassStore()

// Nouvelles méthodes pour les étudiants
const students = await classStore.getStudentsForClass(classId, schoolYearId)
const stats = await classStore.getClassStatistics(classId, schoolYearId)

// Gestion des inscriptions
await classStore.enrollStudentInClass(studentId, classId, schoolYearId)
await classStore.unenrollStudentFromClass(studentId, classId, 'transferred', schoolYearId)
await classStore.transferStudent(studentId, fromClassId, toClassId, schoolYearId)

// Statistiques
const stats = await classStore.getClassStatistics(classId)
console.log(`Total: ${stats.total}, Actifs: ${stats.active}`)
```

### **StudentsStore Étendu**

```typescript
import { useStudentsStore } from '@/stores/studentsStore'

const studentsStore = useStudentsStore()

// Relations avec les classes
const studentClasses = await studentsStore.getStudentClasses(studentId, schoolYearId)
const classStudents = await studentsStore.getStudentsForClass(classId, schoolYearId)

// Inscriptions
await studentsStore.enrollStudentInClass(studentId, classId, schoolYearId)
await studentsStore.unenrollStudentFromClass(studentId, classId, 'graduated', schoolYearId)
await studentsStore.transferStudentToClass(studentId, fromClassId, toClassId, schoolYearId)

// Filtrage par statut
const activeStudents = studentsStore.activeStudents
```

---

## 🎨 Utilisation dans les Composants Vue

### **Affichage des Années Scolaires**

```vue
<template>
  <div>
    <h2>Année Courante: {{ currentSchoolYear?.name }}</h2>

    <select v-model="selectedYearId">
      <option v-for="year in sortedYears" :key="year.id" :value="year.id">
        {{ year.name }} {{ year.is_current ? '(Courante)' : '' }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useSchoolYearStore } from '@/stores/schoolYearStore'

const schoolYearStore = useSchoolYearStore()

const currentSchoolYear = computed(() => schoolYearStore.currentSchoolYear)
const sortedYears = computed(() => schoolYearStore.sortedSchoolYears)
const selectedYearId = ref(currentSchoolYear.value?.id)

// Charger au montage
onMounted(async () => {
  await schoolYearStore.ensureLoaded()
})
</script>
```

### **Liste d'Étudiants avec Classes**

```vue
<template>
  <div>
    <div v-for="student in studentsWithClasses" :key="student.id">
      <h3>{{ student.firstName }} {{ student.lastName }}</h3>
      <div v-for="enrollment in student.classes" :key="enrollment.class_id">
        <span>{{ enrollment.class.name }}</span>
        <span class="status">{{ enrollment.status }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStudentsStore } from '@/stores/studentsStore'
import { useSchoolYearStore } from '@/stores/schoolYearStore'

const studentsStore = useStudentsStore()
const schoolYearStore = useSchoolYearStore()

const studentsWithClasses = ref([])

const loadStudentsWithClasses = async () => {
  const students = studentsStore.allStudents.value
  const currentYear = schoolYearStore.currentSchoolYear

  studentsWithClasses.value = await Promise.all(
    students.map(async (student) => ({
      ...student,
      classes: await studentsStore.getStudentClasses(student.id, currentYear?.id)
    }))
  )
}

onMounted(async () => {
  await schoolYearStore.ensureLoaded()
  await studentsStore.refreshFromSupabase()
  await loadStudentsWithClasses()
})
</script>
```

### **Statistiques de Classe**

```vue
<template>
  <div class="class-stats">
    <h3>{{ className }}</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-number">{{ stats.active }}</span>
        <span class="stat-label">Étudiants Actifs</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.transferred }}</span>
        <span class="stat-label">Transférés</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.graduated }}</span>
        <span class="stat-label">Diplômés</span>
      </div>
    </div>
  </div>
</template>

<script setup>
interface Props {
  classId: string
  className: string
}

const props = defineProps<Props>()

const classStore = useClassStore()
const schoolYearStore = useSchoolYearStore()

const stats = ref({
  total: 0,
  active: 0,
  transferred: 0,
  graduated: 0,
  dropped: 0
})

const loadStats = async () => {
  const currentYear = schoolYearStore.currentSchoolYear
  if (currentYear) {
    stats.value = await classStore.getClassStatistics(props.classId, currentYear.id)
  }
}

onMounted(async () => {
  await schoolYearStore.ensureLoaded()
  await loadStats()
})
</script>
```

---

## 🔄 Patterns Courants

### **1. Inscription Automatique dans Classe Sélectionnée**

```typescript
// Dans StudentsView ou similaire
const handleCreateStudent = async (studentData: any) => {
  // Créer l'étudiant
  const newStudent = await studentsStore.addStudent(studentData)

  // Si une classe est sélectionnée, inscrire automatiquement
  if (classStore.selectedClassId && newStudent) {
    const currentYear = schoolYearStore.currentSchoolYear
    await studentsStore.enrollStudentInClass(
      newStudent.id,
      classStore.selectedClassId,
      currentYear?.id
    )
  }
}
```

### **2. Transfert d'Étudiant**

```typescript
const transferStudent = async (studentId: string, toClassId: string) => {
  const fromClassId = classStore.selectedClassId
  const currentYear = schoolYearStore.currentSchoolYear

  if (fromClassId && currentYear) {
    await studentsStore.transferStudentToClass(
      studentId,
      fromClassId,
      toClassId,
      currentYear.id
    )
  }
}
```

### **3. Changement d'Année Scolaire**

```typescript
const changeSchoolYear = async (newYearId: string) => {
  // Charger les données pour la nouvelle année
  await schoolYearStore.setCurrentSchoolYear(newYearId)

  // Recharger les classes et étudiants
  await classStore.loadClasses()

  // Mettre à jour les statistiques
  if (classStore.selectedClassId) {
    await loadClassStats()
  }
}
```

### **4. Historique d'un Étudiant**

```typescript
const getStudentHistory = async (studentId: string) => {
  const allYears = schoolYearStore.schoolYears

  const history = await Promise.all(
    allYears.map(async (year) => ({
      year: year.name,
      classes: await studentsStore.getStudentClasses(studentId, year.id)
    }))
  )

  return history.filter(h => h.classes.length > 0)
}
```

---

## 🎯 Bonnes Pratiques

### **1. Gestion des Erreurs**

```typescript
try {
  await studentsStore.enrollStudentInClass(studentId, classId, yearId)
} catch (error) {
  if (error.message.includes('already enrolled')) {
    // Étudiant déjà inscrit
    console.warn('Étudiant déjà inscrit dans cette classe')
  } else {
    // Autre erreur
    console.error('Erreur d\'inscription:', error)
  }
}
```

### **2. Validation avant Actions**

```typescript
const canEnrollStudent = (studentId: string, classId: string) => {
  const currentYear = schoolYearStore.currentSchoolYear
  if (!currentYear) {
    throw new Error('Aucune année scolaire courante définie')
  }

  // Autres validations...
  return true
}
```

### **3. Réactivité et Watchers**

```typescript
// Watcher pour recharger les données quand l'année change
watch(
  () => schoolYearStore.currentSchoolYear,
  async (newYear) => {
    if (newYear && classStore.selectedClassId) {
      await loadClassData()
    }
  }
)
```

### **4. Performance**

```typescript
// Utiliser ensureLoaded pour éviter les rechargements
await schoolYearStore.ensureLoaded()

// Batching des opérations
const enrollments = await Promise.all(
  studentIds.map(id =>
    studentsStore.enrollStudentInClass(id, classId, yearId)
  )
)
```

---

## 🔧 Debugging et Monitoring

### **Console Debug**

```typescript
// Activer les logs détaillés
localStorage.setItem('debug', 'school-year-store,class-store,students-store')

// Vérifier l'état des stores
console.log('School Years:', schoolYearStore.schoolYears)
console.log('Current Year:', schoolYearStore.currentSchoolYear)
console.log('Classes:', classStore.classes)
console.log('Students:', studentsStore.allStudents.value)
```

### **Test de l'Architecture**

```typescript
// Exécuter le test complet
import { testNewArchitecture } from '@/test/architecture-test'
const result = await testNewArchitecture()
console.log('Test Result:', result)
```

---

## 🚨 Points d'Attention

### **1. Migration en Cours**
- Vérifier que les tables `school_years` et `student_classes` existent
- Certaines fonctionnalités nécessitent la migration complète

### **2. Données Transitoires**
- Pendant la migration, les deux systèmes coexistent
- Toujours vérifier la disponibilité des données

### **3. Performance**
- Les nouvelles requêtes sont plus complexes (JOINs multiples)
- Utiliser les index et limiter les données chargées

---

**📚 Ce guide sera mis à jour au fur et à mesure de l'évolution de l'architecture.**