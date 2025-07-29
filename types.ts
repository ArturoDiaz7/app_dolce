
export interface EvaluationResponse {
  classification: string;
  severity: 'Grave' | 'Moderada' | 'Leve' | 'Sin Falta';
  legal_reference: string;
  suggested_sanction: string;
  convivencia_comment: string;
  convivencia_warning: boolean;
  legal_text: string;
  interpretation: string;
}

export enum Regulation {
  DOLCE_PARAISO = 'Reglamento de Condóminos de Dolce Paraíso',
  EL_MARQUES = 'Reglamento del Fraccionamiento El Marqués',
  JUSTICIA_CIVICA = 'Reglamento de Justicia Cívica',
}
