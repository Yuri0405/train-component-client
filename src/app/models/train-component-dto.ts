export interface TrainComponentDto {
    id: number;
    name: string;
    uniqueNumber: string;
    canAssignQuantity: boolean;
    quantity: number | null; // Use 'number | null' for nullable integers
  }