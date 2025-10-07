import { supabase } from '@/lib/supabase'

export interface ShareResultsData {
  evaluationId: string
  evaluationName: string
  evaluationDescription?: string
  recipients: string[]
  message: string
  pdfData: string // Base64 encoded PDF
  fileName: string
}

export interface ShareResultsResponse {
  success: boolean
  message: string
  emailsSent?: number
}

interface Student {
  id: string
  firstName: string
  lastName: string
  fullName: string
}

interface CompetencyResult {
  result: number | null
  studentName?: string
}

interface Competency {
  name: string
  domain: string
  field: string
  results: CompetencyResult[]
}

interface EvaluationSummary {
  totalStudents: number
  totalCompetencies: number
}

interface EvaluationDataPDF {
  evaluation: {
    name: string
    description: string
    date: string
    className: string
    schoolYearFilter: string
  }
  students: Student[]
  competencies: Competency[]
  results: unknown[]
  summary: EvaluationSummary
}

/**
 * Service pour partager les résultats d'évaluation par email avec PDF
 */
export const shareResultsService = {
  /**
   * Génère un PDF des résultats d'évaluation
   */
  async generateResultsPDF(evaluationData: EvaluationDataPDF): Promise<string> {
    try {
      const { jsPDF } = await import('jspdf')

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Dimensions du PDF avec marges
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let currentY = margin

      // Fonction helper pour ajouter du texte avec gestion des sauts de page
      const addText = (text: string, fontSize: number, fontWeight: 'normal' | 'bold' = 'normal', marginBottom = 5) => {
        if (currentY + 10 > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
        }
        
        pdf.setFontSize(fontSize)
        if (fontWeight === 'bold') {
          pdf.setFont('helvetica', 'bold')
        } else {
          pdf.setFont('helvetica', 'normal')
        }
        
        pdf.text(text, margin, currentY)
        currentY += marginBottom
      }

      // Fonction helper pour ajouter une ligne
      const addLine = () => {
        if (currentY + 5 > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
        }
        pdf.line(margin, currentY, pageWidth - margin, currentY)
        currentY += 10
      }

      // Titre principal
      addText(`Résultats d'évaluation`, 20, 'bold', 15)
      addLine()

      // Informations sur l'évaluation
      addText(`Évaluation: ${evaluationData.evaluation.name}`, 16, 'bold', 8)
      
      if (evaluationData.evaluation.description) {
        addText(`Description: ${evaluationData.evaluation.description}`, 12, 'normal', 8)
      }
      
      addText(`Date de génération: ${evaluationData.evaluation.date}`, 12, 'normal', 8)
      
      if (evaluationData.evaluation.schoolYearFilter) {
        addText(`Année scolaire: ${evaluationData.evaluation.schoolYearFilter}`, 12, 'normal', 8)
      }
      
      addText(`Nombre d'élèves: ${evaluationData.summary.totalStudents}`, 12, 'normal', 8)
      addText(`Nombre de compétences: ${evaluationData.summary.totalCompetencies}`, 12, 'normal', 15)

      addLine()

      // Section des élèves (si disponibles)
      if (evaluationData.students && evaluationData.students.length > 0) {
        addText('Liste des élèves', 16, 'bold', 10)
        evaluationData.students.forEach((student, index) => {
          addText(`${index + 1}. ${student.fullName}`, 11, 'normal', 5)
        })
        currentY += 10
        addLine()
      }

      // Section des compétences par domaine (si disponibles)
      if (evaluationData.competencies && evaluationData.competencies.length > 0) {
        addText('Compétences évaluées', 16, 'bold', 10)

        // Regrouper les compétences par domaine
        const competenciesByDomain: Record<string, Competency[]> = {}
        evaluationData.competencies.forEach((comp) => {
          if (!competenciesByDomain[comp.domain]) {
            competenciesByDomain[comp.domain] = []
          }
          competenciesByDomain[comp.domain].push(comp)
        })

        // Afficher chaque domaine
        Object.entries(competenciesByDomain).forEach(([domain, competencies]) => {
          addText(domain, 14, 'bold', 8)

          competencies.forEach((comp) => {
            addText(`• ${comp.name} (${comp.field})`, 11, 'normal', 5)
          })

          currentY += 5
        })
      }

      // Section résultats (si disponibles)
      if (evaluationData.competencies && evaluationData.competencies.length > 0 &&
          evaluationData.competencies.some((comp) =>
            comp.results && comp.results.some((result) => result.result !== null)
          )) {
        addLine()
        addText('Résultats détaillés', 16, 'bold', 10)

        evaluationData.competencies.forEach((comp) => {
          if (comp.results && comp.results.length > 0) {
            const hasResults = comp.results.some((result) => result.result !== null)
            if (hasResults) {
              addText(`${comp.name}`, 12, 'bold', 5)
              comp.results.forEach((result) => {
                if (result.result !== null) {
                  addText(`  ${result.studentName}: ${result.result}`, 10, 'normal', 4)
                }
              })
              currentY += 3
            }
          }
        })
      }

      // Pied de page sur la dernière page
      const finalY = pageHeight - 30
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, margin, finalY)
      pdf.text('Application Evaluations - Gestion des compétences', margin, finalY + 5)

      // Retourner le PDF en base64
      return pdf.output('datauristring').split(',')[1]
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      throw new Error('Erreur lors de la génération du PDF')
    }
  },

  /**
   * Envoie les résultats par email via Supabase Edge Function
   */
  async sendResultsByEmail(shareData: ShareResultsData): Promise<ShareResultsResponse> {
    try {
      console.log('📧 Envoi des résultats par email...', {
        recipients: shareData.recipients.length,
        fileName: shareData.fileName
      })

      const { data, error } = await supabase.functions.invoke('send-evaluation-results', {
        body: {
          recipients: shareData.recipients,
          message: shareData.message,
          evaluationName: shareData.evaluationName,
          evaluationDescription: shareData.evaluationDescription,
          pdfData: shareData.pdfData,
          fileName: shareData.fileName
        }
      })

      if (error) {
        console.error('Erreur lors de l\'envoi:', error)
        return {
          success: false,
          message: 'Erreur lors de l\'envoi des emails'
        }
      }

      console.log('Email envoyé avec succès:', data)

      return {
        success: true,
        message: `Email envoyé avec succès à ${shareData.recipients.length} destinataire(s)`,
        emailsSent: shareData.recipients.length
      }
    } catch (error) {
      console.error('Erreur dans sendResultsByEmail:', error)
      return {
        success: false,
        message: 'Erreur de connexion au service d\'envoi'
      }
    }
  },

  /**
   * Valide les données avant l'envoi
   */
  validateShareData(shareData: Partial<ShareResultsData>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!shareData.evaluationId?.trim()) {
      errors.push('ID d\'évaluation manquant')
    }

    if (!shareData.evaluationName?.trim()) {
      errors.push('Nom d\'évaluation manquant')
    }

    if (!shareData.recipients || shareData.recipients.length === 0) {
      errors.push('Aucun destinataire spécifié')
    }

    if (shareData.recipients && shareData.recipients.some(email => !email.includes('@'))) {
      errors.push('Certaines adresses email sont invalides')
    }

    if (!shareData.pdfData?.trim()) {
      errors.push('Données PDF manquantes')
    }

    if (!shareData.fileName?.trim()) {
      errors.push('Nom de fichier manquant')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * Fonction principale pour partager les résultats
   */
  async shareEvaluationResults(
    evaluationData: EvaluationDataPDF,
    recipients: string[],
    message: string
  ): Promise<ShareResultsResponse> {
    try {
      // Générer le PDF
      console.log('📄 Génération du PDF...')
      const pdfData = await this.generateResultsPDF(evaluationData)

      // Préparer les données d'envoi
      const fileName = `evaluation_${evaluationData.evaluation.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      
      const shareData: ShareResultsData = {
        evaluationId: evaluationData.evaluation.id,
        evaluationName: evaluationData.evaluation.name,
        evaluationDescription: evaluationData.evaluation.description,
        recipients,
        message,
        pdfData,
        fileName
      }

      // Valider les données
      const validation = this.validateShareData(shareData)
      if (!validation.valid) {
        return {
          success: false,
          message: `Erreurs de validation: ${validation.errors.join(', ')}`
        }
      }

      // Envoyer l'email
      return await this.sendResultsByEmail(shareData)
    } catch (error) {
      console.error('Erreur dans shareEvaluationResults:', error)
      return {
        success: false,
        message: 'Erreur lors du partage des résultats'
      }
    }
  }
}