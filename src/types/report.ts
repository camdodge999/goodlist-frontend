export type Report = {
    id: string;
    storeId: string;
    reason: string;
    evidenceUrl: string;
    createdAt: string;
    status: "pending" | "valid" | "invalid";
    store?: {
      storeName: string;
    };
  };