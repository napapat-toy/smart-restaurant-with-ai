import AdminClient from "./AdminClient";
import { getAdminData } from "@/app/actions/admin";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const data = await getAdminData();
  
  return <AdminClient initialData={data} />;
}
