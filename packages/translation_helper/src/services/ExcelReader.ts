import * as XLSX from "xlsx";

export class ExcelReader {
  public static readExcelBuffer(buffer: ArrayBuffer) {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  }
}
