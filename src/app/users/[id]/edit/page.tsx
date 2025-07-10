// src/app/users/[id]/edit/page.tsx
import UserForm from "@/components/UserForm";

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const userId = parseInt(params.id);

  return <UserForm mode="edit" userId={userId} />;
}
