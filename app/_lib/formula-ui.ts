export type FormulaUiInput = {
  hasActive: boolean;
  hasDraft: boolean;
  canCreate: boolean;
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
}: FormulaUiInput): FormulaUiState {
  if (hasActive && hasDraft) {
    return {
      statusLabel: "Activa + borrador",
      canContinue: true,
      canView: false,
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
      canCreateVersion: canCreate,
    };
  }

  if (hasDraft) {
    return {
      statusLabel: "Borrador",
      canContinue: true,
      canView: false,
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
