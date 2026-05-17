import connectToDatabase from "@/lib/mongodb";
import { Table } from "@/models/Table";
import QRGeneratorClient from "./QRGeneratorClient";

export default async function QRPage() {
  await connectToDatabase();
  const dbTables = await Table.find().sort({ tableNumber: 1 }).lean();
  
  const formattedTables = dbTables.map((t: any) => ({
    id: t._id.toString(),
    tableNumber: t.tableNumber,
    status: t.status,
    token: t.token
  }));

  return <QRGeneratorClient initialTables={formattedTables} />;
}
