import ExcelJS from "exceljs";

export async function buildXlsxBuffer(
  sheetName: string,
  columns: { key: string; header: string }[],
  rows: Record<string, unknown>[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName.slice(0, 31));
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: 18 }));
  for (const row of rows) {
    ws.addRow(row);
  }
  ws.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
