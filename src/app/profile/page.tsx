import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileClient from "@/components/profile/ProfileClient";
import { User } from "@/types/users";

export default async function ProfilePage() {
  // Get session using server component
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login
  if (!session || !session.user) {
    redirect("/login");
  }

  // Convert the session user to our User type for initial rendering
  // The full data will be fetched by the client-side UserContext
  const initialUser: User = {
    id: session.user.id || session.user.email || "",
    displayName: session.user.displayName || "",
    email: session.user.email || "",
    logo_url: session.user.logo_url || "",
    role: session.user.role || "",
    phoneNumber: "", // Session user may not have phoneNumber
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <ProfileClient user={initialUser} />;
} 