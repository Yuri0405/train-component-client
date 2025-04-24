export interface UpdateTrainComponentDto {
    name: string;
    canAssignQuantity: boolean;
    quantity: number | null; // Quantity can be updated, null if not applicable
    // Note: ID is sent as a route parameter, not in the body.
    // UniqueNumber is typically not updated via a general update DTO.
  }