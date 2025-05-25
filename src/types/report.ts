export type Report = {
    id: string;
    storeId: number;
    reason: string;
    evidenceUrl: string;
    createdAt: string;
    status: "pending" | "reviewed" | "invalid" | "valid";
    store?: {
      storeName: string;
    };
  };