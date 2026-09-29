// Negotiation stages (§12): the main path, and the two branch states with the stage they branch from.
export const MAIN_STAGES = ['Identified', 'Agent engaged', 'Government in negotiation', 'Work agreed', 'Work complete', 'Fire prevented']
export const BRANCHES = { Partial: 'Work agreed', 'State plan': 'Government in negotiation' }

/** Position of a stage on the main path (a branch counts as the stage it leaves from). */
export function stageIndex(stage) {
  const i = MAIN_STAGES.indexOf(BRANCHES[stage] ?? stage)
  return i < 0 ? 0 : i
}
