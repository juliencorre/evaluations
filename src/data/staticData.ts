import type { 
  Student, 
  CompetencyFramework, 
  Evaluation, 
  EvaluationResult 
} from '@/types/evaluation'

export const STUDENTS: Student[] = [
  { id: 'student-01', firstName: 'Alice', lastName: 'Martin', displayName: 'Alice M.' },
  { id: 'student-02', firstName: 'Bob', lastName: 'Durand', displayName: 'Bob D.' },
  { id: 'student-03', firstName: 'Claire', lastName: 'Lefebvre', displayName: 'Claire L.' },
  { id: 'student-04', firstName: 'David', lastName: 'Moreau', displayName: 'David M.' },
  { id: 'student-05', firstName: 'Emma', lastName: 'Bernard', displayName: 'Emma B.' },
  { id: 'student-06', firstName: 'François', lastName: 'Petit', displayName: 'François P.' },
  { id: 'student-07', firstName: 'Gabrielle', lastName: 'Roux', displayName: 'Gabrielle R.' },
  { id: 'student-08', firstName: 'Hugo', lastName: 'Vincent', displayName: 'Hugo V.' },
  { id: 'student-09', firstName: 'Isabelle', lastName: 'Fournier', displayName: 'Isabelle F.' },
  { id: 'student-10', firstName: 'Julien', lastName: 'Michel', displayName: 'Julien M.' },
  { id: 'student-11', firstName: 'Léa', lastName: 'Garcia', displayName: 'Léa G.' },
  { id: 'student-12', firstName: 'Marc', lastName: 'Rodriguez', displayName: 'Marc R.' },
  { id: 'student-13', firstName: 'Nina', lastName: 'Lopez', displayName: 'Nina L.' },
  { id: 'student-14', firstName: 'Olivier', lastName: 'Gonzalez', displayName: 'Olivier G.' },
  { id: 'student-15', firstName: 'Pauline', lastName: 'Perez', displayName: 'Pauline P.' },
  { id: 'student-16', firstName: 'Quentin', lastName: 'Sanchez', displayName: 'Quentin S.' },
  { id: 'student-17', firstName: 'Raphaëlle', lastName: 'Ramirez', displayName: 'Raphaëlle R.' },
  { id: 'student-18', firstName: 'Simon', lastName: 'Torres', displayName: 'Simon T.' },
  { id: 'student-19', firstName: 'Théa', lastName: 'Flores', displayName: 'Théa F.' },
  { id: 'student-20', firstName: 'Ulysse', lastName: 'Rivera', displayName: 'Ulysse R.' },
  { id: 'student-21', firstName: 'Valérie', lastName: 'Gomez', displayName: 'Valérie G.' },
  { id: 'student-22', firstName: 'William', lastName: 'Diaz', displayName: 'William D.' },
  { id: 'student-23', firstName: 'Xavier', lastName: 'Ruiz', displayName: 'Xavier R.' },
  { id: 'student-24', firstName: 'Yasmine', lastName: 'Hernandez', displayName: 'Yasmine H.' },
  { id: 'student-25', firstName: 'Zoé', lastName: 'Jimenez', displayName: 'Zoé J.' },
  { id: 'student-26', firstName: 'Antoine', lastName: 'Morales', displayName: 'Antoine M.' },
  { id: 'student-27', firstName: 'Béatrice', lastName: 'Castro', displayName: 'Béatrice C.' },
  { id: 'student-28', firstName: 'Clément', lastName: 'Ortega', displayName: 'Clément O.' },
  { id: 'student-29', firstName: 'Delphine', lastName: 'Gutierrez', displayName: 'Delphine G.' },
  { id: 'student-30', firstName: 'Étienne', lastName: 'Vargas', displayName: 'Étienne V.' }
]

export const COMPETENCY_FRAMEWORK: CompetencyFramework = {
  id: 'framework-fr-primary',
  name: 'Référentiel de compétences - Enseignement primaire français',
  version: '2023.1',
  domains: [
    {
      id: 'domain-langue',
      name: 'Langue française',
      description: 'Maîtrise de la langue française orale et écrite',
      fields: [
        {
          id: 'field-oral',
          name: 'Langage oral',
          description: 'Expression et compréhension orales',
          competencies: [
            {
              id: 'comp-ecoute',
              name: 'Écouter et comprendre',
              description: 'Comprendre des messages oraux variés',
              specificCompetencies: [
                {
                  id: 'spec-ecoute-1',
                  name: 'Écouter un récit et manifester sa compréhension',
                  description: 'Capacité à suivre et comprendre un récit oral'
                },
                {
                  id: 'spec-ecoute-2',
                  name: 'Écouter des textes documentaires et retenir des informations',
                  description: 'Extraire l\'information pertinente d\'un discours informatif'
                }
              ]
            },
            {
              id: 'comp-expression',
              name: 'S\'exprimer à l\'oral',
              description: 'Produire des messages oraux adaptés',
              specificCompetencies: [
                {
                  id: 'spec-expression-1',
                  name: 'Dire pour être entendu et compris',
                  description: 'Articuler clairement et adapter son débit'
                },
                {
                  id: 'spec-expression-2',
                  name: 'Participer à des échanges dans des situations variées',
                  description: 'Prendre part aux conversations et débats'
                }
              ]
            }
          ]
        },
        {
          id: 'field-lecture',
          name: 'Lecture et compréhension de l\'écrit',
          description: 'Décodage et compréhension de textes écrits',
          competencies: [
            {
              id: 'comp-decoder',
              name: 'Identifier des mots de manière de plus en plus aisée',
              description: 'Automatisation du décodage',
              specificCompetencies: [
                {
                  id: 'spec-decoder-1',
                  name: 'Discriminer auditivement les phonèmes',
                  description: 'Reconnaître et distinguer les sons de la langue'
                },
                {
                  id: 'spec-decoder-2',
                  name: 'Connaître les correspondances graphophonologiques',
                  description: 'Maîtriser les relations lettres-sons'
                }
              ]
            },
            {
              id: 'comp-comprendre-texte',
              name: 'Comprendre un texte',
              description: 'Construire le sens d\'un texte écrit',
              specificCompetencies: [
                {
                  id: 'spec-comprendre-1',
                  name: 'Mobiliser ses expériences antérieures de lecture',
                  description: 'Utiliser ses connaissances pour interpréter'
                },
                {
                  id: 'spec-comprendre-2',
                  name: 'Mettre en relation différentes informations',
                  description: 'Établir des liens dans le texte'
                }
              ]
            }
          ]
        },
        {
          id: 'field-ecriture',
          name: 'Écriture',
          description: 'Production d\'écrits variés',
          competencies: [
            {
              id: 'comp-ecrire',
              name: 'Écrire des textes en commençant à s\'approprier une démarche',
              description: 'Planifier, mettre en texte, réviser',
              specificCompetencies: [
                {
                  id: 'spec-ecrire-1',
                  name: 'Identifier les caractéristiques propres à différents genres de textes',
                  description: 'Reconnaître les spécificités textuelles'
                },
                {
                  id: 'spec-ecrire-2',
                  name: 'Mobiliser ses connaissances sur la langue',
                  description: 'Appliquer les règles orthographiques et grammaticales'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'domain-maths',
      name: 'Mathématiques',
      description: 'Raisonnement mathématique et résolution de problèmes',
      fields: [
        {
          id: 'field-nombres',
          name: 'Nombres et calculs',
          description: 'Compréhension et utilisation des nombres',
          competencies: [
            {
              id: 'comp-nombres-entiers',
              name: 'Comprendre et utiliser des nombres entiers',
              description: 'Maîtrise des nombres entiers et de leurs propriétés',
              specificCompetencies: [
                {
                  id: 'spec-nombres-1',
                  name: 'Dénombrer, constituer et comparer des collections',
                  description: 'Quantifier et comparer des ensembles d\'objets'
                },
                {
                  id: 'spec-nombres-2',
                  name: 'Utiliser diverses représentations des nombres',
                  description: 'Passer d\'une représentation à l\'autre'
                }
              ]
            },
            {
              id: 'comp-calcul',
              name: 'Calculer avec des nombres entiers',
              description: 'Effectuer des calculs mentaux et posés',
              specificCompetencies: [
                {
                  id: 'spec-calcul-1',
                  name: 'Mémoriser des faits numériques et des procédures',
                  description: 'Connaître les tables et automatismes de calcul'
                },
                {
                  id: 'spec-calcul-2',
                  name: 'Élaborer ou choisir des stratégies de calcul',
                  description: 'Adapter sa stratégie au contexte'
                }
              ]
            }
          ]
        },
        {
          id: 'field-geometrie',
          name: 'Espace et géométrie',
          description: 'Représentation et propriétés géométriques',
          competencies: [
            {
              id: 'comp-espace',
              name: 'Se repérer et se déplacer dans l\'espace',
              description: 'Orientation et localisation spatiale',
              specificCompetencies: [
                {
                  id: 'spec-espace-1',
                  name: 'Situer des objets ou des personnes les uns par rapport aux autres',
                  description: 'Utiliser le vocabulaire spatial'
                },
                {
                  id: 'spec-espace-2',
                  name: 'Programmer les déplacements d\'un robot',
                  description: 'Concevoir et coder des parcours'
                }
              ]
            },
            {
              id: 'comp-figures',
              name: 'Reconnaître, nommer, décrire des figures géométriques',
              description: 'Identifier et caractériser les formes',
              specificCompetencies: [
                {
                  id: 'spec-figures-1',
                  name: 'Reconnaître et nommer les figures usuelles',
                  description: 'Identifier triangle, carré, rectangle, cercle...'
                },
                {
                  id: 'spec-figures-2',
                  name: 'Décrire, reproduire des figures ou des assemblages',
                  description: 'Communiquer sur les propriétés géométriques'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'domain-science',
      name: 'Sciences et technologie',
      description: 'Démarche scientifique et technologique',
      fields: [
        {
          id: 'field-vivant',
          name: 'Le vivant, sa diversité et les fonctions qui le caractérisent',
          description: 'Étude du monde vivant',
          competencies: [
            {
              id: 'comp-vivant-diversite',
              name: 'Classer les organismes vivants',
              description: 'Identifier et organiser la diversité du vivant',
              specificCompetencies: [
                {
                  id: 'spec-vivant-1',
                  name: 'Identifier des caractères communs et des différences',
                  description: 'Observer et comparer les êtres vivants'
                },
                {
                  id: 'spec-vivant-2',
                  name: 'Utiliser différents critères de classement',
                  description: 'Organiser selon différents critères'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

function generateRandomResults(): EvaluationResult[] {
  const results: EvaluationResult[] = []
  const levels = ['A', 'B', 'C', 'D', 'E', 'N/A'] as const
  
  // Function to get all competency IDs recursively
  function getAllCompetencyIds(framework: CompetencyFramework): string[] {
    const ids: string[] = []
    
    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        field.competencies.forEach(competency => {
          ids.push(competency.id)
          competency.specificCompetencies.forEach(specific => {
            ids.push(specific.id)
          })
        })
      })
    })
    
    return ids
  }
  
  const allCompetencyIds = getAllCompetencyIds(COMPETENCY_FRAMEWORK)
  
  // Generate results for each student and competency
  STUDENTS.forEach(student => {
    allCompetencyIds.forEach(competencyId => {
      // Generate some variation in results (not all students have all evaluations)
      if (Math.random() > 0.1) { // 90% chance of having a result
        results.push({
          studentId: student.id,
          competencyId: competencyId,
          level: levels[Math.floor(Math.random() * levels.length)],
          evaluatedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
        })
      }
    })
  })
  
  return results
}

export const SAMPLE_EVALUATION: Evaluation = {
  id: 'eval-2024-t1',
  name: 'Évaluation Trimestre 1 - 2024',
  description: 'Première évaluation de l\'année scolaire 2024',
  frameworkId: 'framework-fr-primary',
  classId: 'class-cm1-a',
  createdAt: '2024-01-15T08:00:00.000Z',
  results: generateRandomResults()
}