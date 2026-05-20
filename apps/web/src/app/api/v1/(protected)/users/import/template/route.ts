import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import * as XLSX from "xlsx";

export const GET = withAuth(
  async () => {
    const workbook = XLSX.utils.book_new();

    const data = [
      ["Nome", "Matrícula", "Data de Nascimento"],
      ["Maria da Silva", "2026001", "15/03/2015"],
      ["João Santos", "2026002", "22/07/2014"],
      ["Ana Oliveira", "2026003", "10/01/2016"],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(data);

    sheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, sheet, "Alunos");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="modelo_importacao_alunos.xlsx"',
      },
    });
  },
  { allowedRoles: ["ADMIN"] },
);
