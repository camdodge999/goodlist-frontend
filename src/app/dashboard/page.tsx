import DashboardPage from "@/components/pages/DashboardPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;
  
  return (
    <DashboardPage 
      userId={userId} 
    />
  );
} 