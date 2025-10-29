export interface NutrientNeeds {
    element: string;
    norm: number;
}

export interface CalculationResults {
    culture: string;
    basic: NutrientNeeds[];
    fertigation: NutrientNeeds[];
}

export interface CultureParams {
    nitrogenFactor: number;
    potassiumRanges: { min: number; max: number; value: number }[];
    calciumFactor: number;
    magnesiumFactor: number;
}

export interface FormData {
    culture: string;
    plannedYield: string;
    nitrogenAnalysis: string;
    ph: string;
    phosphorus: string;
    potassium: string;
    calcium: string;
    magnesium: string;
    cec: string;
    amendment: string;
}

export type BasicFertilizerSelections = {
    [element: string]: {
        selectedFertilizer: string;
    };
};

export interface SavedReport {
  id: string;
  timestamp: string;
  formData: FormData;
  results: CalculationResults;
  calculationType: 'basic' | 'fertigation' | 'full';
  springFertilizer: { n: string; p: string; k: string; ca: string; mg: string; };
  nitrogenFertilizer: string;
  basicFertilizers: BasicFertilizerSelections;
  selectedAmendment: string;
}