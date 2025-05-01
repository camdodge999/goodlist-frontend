import DashboardPage from "@/components/pages/DashboardPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock API responses for SSR - replace with actual API calls
async function fetchStoreRequests(userId: string | undefined) {
  // This would be a real API call in production
  return { data: [] };
}

async function fetchReports(userId: string | undefined) {
  // This would be a real API call in production
  return { data: [] };
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;
  
  // Fetch data server-side
  const [storeRequestsData, reportsData] = await Promise.all([
    fetchStoreRequests(userId),
    fetchReports(userId)
  ]);

  return (
    <DashboardPage 
      userId={userId} 
      initialStoreRequests={storeRequestsData.data}
      initialReports={reportsData.data}
    />
  );
} 