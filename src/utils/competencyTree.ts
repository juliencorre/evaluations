import type { CompetencyFramework, TreeNode, EvaluationResult } from '@/types/evaluation'

export function buildCompetencyTree(framework: CompetencyFramework): TreeNode[] {
  const tree: TreeNode[] = []

  framework.domains.forEach((domain) => {
    domain.fields.forEach((field) => {
      field.competencies.forEach((competency) => {
        competency.specificCompetencies.forEach((specificCompetency) => {
          // Create specific competency nodes with separate hierarchy data
          const specificNode: TreeNode = {
            id: specificCompetency.id,
            name: specificCompetency.name,
            type: 'specificCompetency',
            level: 0,
            originalItem: specificCompetency,
            hierarchyData: {
              domain: domain.name,
              field: field.name,
              competency: competency.name,
              specificCompetency: specificCompetency.name
            }
          }

          tree.push(specificNode)
        })
      })
    })
  })

  return tree
}

export function flattenTree(tree: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      result.push(node)
      if (node.isExpanded && node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  return result
}

export function toggleNodeExpansion(tree: TreeNode[], nodeId: string): TreeNode[] {
  function updateNode(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          isExpanded: !node.isExpanded
        }
      }

      if (node.children) {
        return {
          ...node,
          children: updateNode(node.children)
        }
      }

      return node
    })
  }

  return updateNode(tree)
}

export function getCompetencyResult(
  results: EvaluationResult[],
  studentId: string,
  competencyId: string
): EvaluationResult | undefined {
  return results.find(
    (result) => result.studentId === studentId && result.competencyId === competencyId
  )
}

export function getCompetencyIds(tree: TreeNode[]): string[] {
  const ids: string[] = []

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (node.type === 'competency' || node.type === 'specificCompetency') {
        ids.push(node.id)
      }
      if (node.children) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  return ids
}

export function searchTree(tree: TreeNode[], searchTerm: string): TreeNode[] {
  if (!searchTerm.trim()) {
    return tree
  }

  const searchLower = searchTerm.toLowerCase()

  function matchesSearch(node: TreeNode): boolean {
    return node.name.toLowerCase().includes(searchLower)
  }

  function filterNode(node: TreeNode): TreeNode | null {
    const matches = matchesSearch(node)
    const filteredChildren = (node.children?.map(filterNode).filter(Boolean) as TreeNode[]) || []

    if (matches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
        isExpanded: true // Expand matching nodes
      }
    }

    return null
  }

  return tree.map(filterNode).filter(Boolean) as TreeNode[]
}
