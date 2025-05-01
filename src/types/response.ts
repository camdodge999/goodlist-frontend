
export type BodyResponse<T> = 
  | {
      status: "success";
      data: T;
      message: null; // Message is null for successful responses
    }
  | {
      status: "error";
      message: string; // Message contains the error message
      details: Record<string, unknown>;
    };
