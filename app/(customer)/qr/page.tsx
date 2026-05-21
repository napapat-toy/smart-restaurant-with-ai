import connectToDatabase from "@/lib/mongodb";
import { Table } from "@/models/Table";
import QRGeneratorClient from "./QRGeneratorClient";

export default async function QRPage() {
  await connectToDatabase();
  const dbTables = await Table.find().lean();
  
  const formattedTables = dbTables.map((t: any) => ({
    id: t._id.toString(),
    tableNumber: t.tableNumber,
    status: t.status,
    token: t.token
  }));

  // Sort tables numerically by tableNumber
  formattedTables.sort((a, b) => {
    const numA = parseInt(a.tableNumber, 10);
    const numB = parseInt(b.tableNumber, 10);
    if (isNaN(numA) || isNaN(numB)) {
      return a.tableNumber.localeCompare(b.tableNumber);
    }
    return numA - numB;
  });

  return <QRGeneratorClient initialTables={formattedTables} />;
}
