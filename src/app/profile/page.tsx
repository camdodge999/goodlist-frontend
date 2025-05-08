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

  // Convert the session user to our User type
  const user: User = {
    id: session.user.id || session.user.email || "",
    displayName: session.user.displayName || "",
    email: session.user.email || "",
    image: session.user.image || "",
    role: session.user.role || "",
    phoneNumber: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <ProfileClient user={user} />;
} 