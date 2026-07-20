import ExcelJS from "exceljs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const workbook = new ExcelJS.Workbook();

        const templatePath = path.join(
            process.cwd(),
            "templates",
            "SF2_Template.xlsx"
        );

        await workbook.xlsx.readFile(templatePath);

        const result = workbook.worksheets.map(
            (worksheet) => {
                const cells: {
                    cell: string;
                    value: string;
                }[] = [];

                worksheet.eachRow(
                    { includeEmpty: false },
                    (row) => {
                        row.eachCell(
                            { includeEmpty: false },
                            (cell) => {
                                if (
                                    cell.value !== null &&
                                    cell.value !== undefined &&
                                    String(cell.value).trim() !== ""
                                ) {
                                    cells.push({
                                        cell: cell.address,
                                        value: String(cell.value),
                                    });
                                }
                            }
                        );
                    }
                );

                return {
                    sheet: worksheet.name,
                    rowCount: worksheet.rowCount,
                    columnCount: worksheet.columnCount,
                    cells,
                };
            }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to inspect SF2 template.",
            },
            {
                status: 500,
            }
        );
    }
}