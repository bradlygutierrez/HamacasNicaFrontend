export type FormulaUiInput = {
  hasActive: boolean;
  hasDraft: boolean;
  canCreate: boolean;
  canEdit?: boolean;
};

export type FormulaUiState = {
  statusLabel: "Sin fórmula" | "Borrador" | "Activa" | "Activa + borrador";
  canContinue: boolean;
  canView: boolean;
  canCreate: boolean;
  canCreateVersion: boolean;
};

export function getFormulaUiState({
  hasActive,
  hasDraft,
  canCreate,
  canEdit = canCreate,
}: FormulaUiInput): FormulaUiState {
  if (hasActive && hasDraft) {
    return {
      statusLabel: "Activa + borrador",
      canContinue: canEdit,
      canView: !canEdit,
      canCreate: false,
      canCreateVersion: false,
    };
  }

  if (hasActive) {
    return {
      statusLabel: "Activa",
      canContinue: false,
      canView: true,
      canCreate: false,
      canCreateVersion: canCreate && canEdit,
    };
  }

  if (hasDraft) {
    return {
      statusLabel: "Borrador",
      canContinue: canEdit,
      canView: !canEdit,
      canCreate: false,
      canCreateVersion: false,
    };
  }

  return {
    statusLabel: "Sin fórmula",
    canContinue: false,
    canView: false,
    canCreate,
    canCreateVersion: false,
  };
}
