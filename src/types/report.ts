export type Report = {
    id: string;
    storeId: string;
    reason: string;
    evidenceUrls: string;
    createdAt: string;
    status: "pending" | "valid" | "invalid";
    store?: {
      storeName: string;
    };
  };