import { Store, ContactInfo } from "@/types/stores";
import { BodyResponse } from "@/types/response";

// Mock data - would be replaced with actual API calls
const mockStores: Store[] = [
  {
    id: 1,
    userId: 1,
    storeName: "Example Store",
    bankAccount: "XXX-X-XXXXX-X",
    contactInfo: {
      line: "@examplestore",
      facebook: "ExampleStorePage",
      phone: "08-1234-5678",
      address: "123 Example St., Bangkok, Thailand",
    },
    description: "This is an example store description.",
    isVerified: true,
    isBanned: false,
    createdAt: "2023-02-15T08:30:00Z",
    updatedAt: "2023-02-15T08:30:00Z",
    imageUrl: "/images/logo.png",
  },
  // Add more mock stores as needed
];

/**
 * Get all stores
 * 
 * @returns Promise that resolves to array of stores
 */
export async function getStores(): Promise<Store[]> {
  // In production this would be an API call
  return Promise.resolve(mockStores);
}

/**
 * Get store by ID
 * 
 * @param id - Store ID
 * @returns Promise that resolves to store or null if not found
 */
export async function getStoreById(id: number): Promise<Store | null> {
  // In production this would be an API call
  const store = mockStores.find(s => s.id === id);
  return Promise.resolve(store || null);
}

/**
 * Create a new store
 * 
 * @param storeData - New store data
 * @returns Promise that resolves to created store
 */
export async function createStore(storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
  // In production this would be an API call
  const newStore: Store = {
    ...storeData,
    id: Math.max(...mockStores.map(s => s.id)) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockStores.push(newStore);
  return Promise.resolve(newStore);
}

/**
 * Update an existing store
 * 
 * @param id - Store ID
 * @param storeData - Updated store data
 * @returns Promise that resolves to updated store
 */
export async function updateStore(id: number, storeData: Partial<Store>): Promise<Store | null> {
  // In production this would be an API call
  const storeIndex = mockStores.findIndex(s => s.id === id);
  
  if (storeIndex === -1) {
    return Promise.resolve(null);
  }
  
  const updatedStore = {
    ...mockStores[storeIndex],
    ...storeData,
    updatedAt: new Date().toISOString(),
  };
  
  mockStores[storeIndex] = updatedStore;
  return Promise.resolve(updatedStore);
}

// Server-side function to fetch stores
export async function fetchStores(): Promise<BodyResponse<Store[]>> {
  try {
    const response = await fetch(`/api/stores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stores:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {}
    };
  }
}

// Function to fetch a single store by ID
export async function fetchStoreById(id: number): Promise<BodyResponse<Store>> {
  try {
    const response = await fetch(`/api/stores/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch store: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {}
    };
  }
} 