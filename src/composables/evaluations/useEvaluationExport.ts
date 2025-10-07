import type { Evaluation, EvaluationResult } from '@/types/evaluation'
import type { Student } from '@/types/student'
import type { CompetencyFramework } from '@/types/competency'

export interface ExportData {
  evaluation: {
    id: string
    name: string
    description: string
    date: string
    className: string
    schoolYearFilter: string
  }
  students: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
  }>
  results: EvaluationResult[]
  competencies: any[]
}

/**
 * Composable pour l'export d'évaluations
 */
export function useEvaluationExport() {
  /**
   * Génère un CSV à partir des données d'export
   */
  const generateCSV = (data: ExportData): string => {
    const lines: string[] = []

    // En-tête
    lines.push(`Évaluation: ${data.evaluation.name}`)
    lines.push(`Description: ${data.evaluation.description}`)
    lines.push(`Date: ${data.evaluation.date}`)
    lines.push(`Classe: ${data.evaluation.className}`)
    lines.push(`Année scolaire: ${data.evaluation.schoolYearFilter}`)
    lines.push('') // Ligne vide

    // Ligne d'en-tête du tableau
    const headers = ['Élève', 'Prénom', 'Nom', ...data.competencies.map(c => c.name)]
    lines.push(headers.map(h => `"${h}"`).join(','))

    // Données des élèves
    data.students.forEach(student => {
      const row = [
        student.fullName,
        student.firstName,
        student.lastName,
        ...data.competencies.map(competency => {
          const result = data.results.find(
            r => r.studentId === student.id &&
            (r.specificCompetencyId === competency.id || r.competencyId === competency.id)
          )
          return result?.value || 'N/A'
        })
      ]
      lines.push(row.map(cell => `"${cell}"`).join(','))
    })

    return lines.join('\n')
  }

  /**
   * Télécharge un fichier CSV
   */
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Exporte une évaluation en CSV
   */
  const exportToCSV = (
    evaluation: Evaluation,
    students: Student[],
    results: EvaluationResult[],
    framework: CompetencyFramework,
    className = '',
    schoolYearName = ''
  ) => {
    // Préparer les compétences
    const competencies = framework.domains.flatMap(domain =>
      domain.fields.flatMap(field =>
        field.competencies.flatMap(competency =>
          competency.specificCompetencies.map(sc => ({
            id: sc.id,
            name: sc.name
          }))
        )
      )
    )

    const exportData: ExportData = {
      evaluation: {
        id: evaluation.id,
        name: evaluation.name,
        description: evaluation.description || '',
        date: new Date(evaluation.createdAt).toLocaleDateString('fr-FR'),
        className,
        schoolYearFilter: schoolYearName
      },
      students: students.map(s => ({
        id: s.id,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        fullName: `${s.firstName || ''} ${s.lastName || ''}`.trim()
      })),
      results,
      competencies
    }

    const csvContent = generateCSV(exportData)
    const fileName = `evaluation_${evaluation.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`

    downloadCSV(csvContent, fileName)
  }

  /**
   * Génère un JSON d'export
   */
  const exportToJSON = (
    evaluation: Evaluation,
    students: Student[],
    results: EvaluationResult[],
    framework: CompetencyFramework
  ) => {
    const data = {
      evaluation: {
        id: evaluation.id,
        name: evaluation.name,
        description: evaluation.description,
        createdAt: evaluation.createdAt,
        frameworkId: evaluation.frameworkId
      },
      students,
      results,
      framework
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `evaluation_${evaluation.id}.json`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return {
    generateCSV,
    downloadCSV,
    exportToCSV,
    exportToJSON
  }
}
