import MenuClient from "./components/MenuClient";
import { getMenuItems } from "./actions/menu";

export default async function Home(props: { searchParams: Promise<{ table?: string, token?: string }> }) {
  const searchParams = await props.searchParams;
  const table = searchParams.table || "1";
  const token = searchParams.token || "";

  const menuItems = await getMenuItems();

  return <MenuClient tableNumber={table} token={token} initialMenuItems={menuItems} />;
}
