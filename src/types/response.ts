
export type BodyResponse<T> = { 
    statusCode: number;
    data: T | undefined;
    message: string | null; // Message is null for successful responses
  }