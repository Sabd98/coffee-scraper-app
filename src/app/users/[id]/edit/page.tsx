// src/app/users/[id]/edit/page.tsx
import UserForm from "@/components/UserForm";
import { use } from "react";



export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = parseInt(id);

  return <UserForm mode="edit" userId={userId} />;
}
