import { requireAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  const session = await requireAdmin();
  return <p className="p-8">Вы вошли как {session.login}</p>;
}
