export type Report = {
    id: string;
    storeId: number;
    reason: string;
    evidenceUrl: string;
    createdAt: string;
    status: "pending" | "reviewed" | "rejected" | "invalid";
    store?: {
      storeName: string;
    };
  };