import { User } from "@/types/stores";

// Mock data - would be replaced with actual API calls
const mockUsers: User[] = [
  {
    id: 1,
    displayName: "Example User",
    email: "user@example.com",
    role: "user",
    isVerified: true,
    createdAt: "2023-01-10T08:30:00Z",
    updatedAt: "2023-01-10T08:30:00Z",
  },
  {
    id: 2,
    displayName: "Admin User",
    email: "admin@example.com",
    role: "admin",
    isVerified: true,
    createdAt: "2023-01-05T10:15:00Z",
    updatedAt: "2023-01-05T10:15:00Z",
  },
  // Add more mock users as needed
];

/**
 * Get all users
 * 
 * @returns Promise that resolves to array of users
 */
export async function getUsers(): Promise<User[]> {
  // In production this would be an API call
  return Promise.resolve(mockUsers);
}

/**
 * Get user by ID
 * 
 * @param id - User ID
 * @returns Promise that resolves to user or null if not found
 */
export async function getUserById(id: number): Promise<User | null> {
  // In production this would be an API call
  const user = mockUsers.find(u => u.id === id);
  return Promise.resolve(user || null);
}

/**
 * Get current user (for auth)
 * 
 * @returns Promise that resolves to current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<{ isLoggedIn: boolean; user: User | null }> {
  // In production this would check auth state and get the current user
  // For mock, we'll just return the first user as logged in
  return Promise.resolve({
    isLoggedIn: true,
    user: mockUsers[0]
  });
} 