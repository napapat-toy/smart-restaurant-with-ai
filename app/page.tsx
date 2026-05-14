import MenuClient from "./components/MenuClient";

export default async function Home(props: { searchParams: Promise<{ table?: string }> }) {
  const searchParams = await props.searchParams;
  const table = searchParams.table || "1";

  return <MenuClient tableNumber={table} />;
}
