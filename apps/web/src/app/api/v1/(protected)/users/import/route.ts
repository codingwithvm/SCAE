import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

interface StudentRow {
  name: string;
  registrationNumber: string;
  birthDate: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

const EXPECTED_HEADERS = ["Nome", "Matrícula", "Data de Nascimento"];

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapHeader(header: string): string | null {
  const normalized = normalizeHeader(header);

  if (normalized === "nome") return "name";
  if (normalized === "matricula") return "registrationNumber";
  if (normalized === "data de nascimento") return "birthDate";

  return null;
}

function parseBrazilianDate(dateValue: unknown): Date | null {
  if (dateValue instanceof Date) {
    if (Number.isNaN(dateValue.getTime())) return null;
    return dateValue;
  }

  if (typeof dateValue === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const parsed = new Date(excelEpoch.getTime() + dateValue * 86400000);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  if (typeof dateValue !== "string") return null;

  const trimmed = dateValue.trim();

  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const parsed = new Date(`${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  return null;
}

function validateRow(
  row: Record<string, unknown>,
  rowIndex: number,
): { student: StudentRow; errors: ImportError[] } {
  const errors: ImportError[] = [];

  const name = typeof row.name === "string" ? row.name.trim() : "";
  const registrationNumber =
    row.registrationNumber != null ? String(row.registrationNumber).trim() : "";
  const birthDateRaw = row.birthDate;

  if (!name) {
    errors.push({
      row: rowIndex,
      field: "Nome",
      message: "Nome é obrigatório",
    });
  }

  if (!registrationNumber) {
    errors.push({
      row: rowIndex,
      field: "Matrícula",
      message: "Matrícula é obrigatória",
    });
  }

  const parsedDate = parseBrazilianDate(birthDateRaw);
  if (!parsedDate) {
    errors.push({
      row: rowIndex,
      field: "Data de Nascimento",
      message: "Data de nascimento inválida (use DD/MM/AAAA)",
    });
  }

  return {
    student: {
      name,
      registrationNumber,
      birthDate: parsedDate ? parsedDate.toISOString() : "",
    },
    errors,
  };
}

export const POST = withAuth(
  async (request) => {
    const formData = await request.formData();
    const file = formData.get("file");
    const schoolId = formData.get("schoolId");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo Excel é obrigatório" },
        { status: 400 },
      );
    }

    if (!schoolId || typeof schoolId !== "string") {
      return NextResponse.json(
        { error: "Escola é obrigatória" },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const isExcel =
      allowedTypes.includes(file.type) ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isExcel) {
      return NextResponse.json(
        { error: "Formato inválido. Envie um arquivo .xlsx ou .xls" },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 5MB" },
        { status: 400 },
      );
    }

    const existingSchool = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
      select: { id: true, municipalityId: true },
    });

    if (!existingSchool) {
      return NextResponse.json(
        { error: "Escola não encontrada" },
        { status: 404 },
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: "Planilha vazia" }, { status: 400 });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    if (rawRows.length === 0) {
      return NextResponse.json(
        { error: "Planilha não contém dados" },
        { status: 400 },
      );
    }

    const headers = Object.keys(rawRows[0]);
    const headerMap: Record<string, string> = {};
    const missingHeaders: string[] = [];

    for (const expected of EXPECTED_HEADERS) {
      const found = headers.find(
        (h) => normalizeHeader(h) === normalizeHeader(expected),
      );
      if (found) {
        const mapped = mapHeader(found);
        if (mapped) headerMap[found] = mapped;
      } else {
        missingHeaders.push(expected);
      }
    }

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Colunas obrigatórias não encontradas: ${missingHeaders.join(", ")}. Use o modelo disponível para download.`,
        },
        { status: 400 },
      );
    }

    const maxRows = 1000;
    if (rawRows.length > maxRows) {
      return NextResponse.json(
        { error: `Máximo de ${maxRows} alunos por importação` },
        { status: 400 },
      );
    }

    const allErrors: ImportError[] = [];
    const validStudents: {
      name: string;
      registrationNumber: string;
      birthDate: Date;
    }[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const rawRow = rawRows[i];
      const mappedRow: Record<string, unknown> = {};

      for (const [originalKey, mappedKey] of Object.entries(headerMap)) {
        mappedRow[mappedKey] = rawRow[originalKey];
      }

      const { student, errors } = validateRow(mappedRow, i + 2);

      if (errors.length > 0) {
        allErrors.push(...errors);
      } else {
        validStudents.push({
          name: student.name,
          registrationNumber: student.registrationNumber,
          birthDate: new Date(student.birthDate),
        });
      }
    }

    if (allErrors.length > 0 && validStudents.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum aluno válido encontrado na planilha",
          created: 0,
          errors: allErrors,
        },
        { status: 400 },
      );
    }

    const existingRegistrations = await prisma.user.findMany({
      where: {
        registrationNumber: {
          in: validStudents.map((s) => s.registrationNumber),
        },
        deletedAt: null,
      },
      select: { registrationNumber: true },
    });

    const existingSet = new Set(
      existingRegistrations.map((u) => u.registrationNumber),
    );

    const duplicateErrors: ImportError[] = [];
    const newStudents = validStudents.filter((s) => {
      if (existingSet.has(s.registrationNumber)) {
        const rowIndex =
          rawRows.findIndex((r) => {
            const regCol = Object.entries(headerMap).find(
              ([, v]) => v === "registrationNumber",
            );
            return regCol
              ? String(r[regCol[0]]).trim() === s.registrationNumber
              : false;
          }) + 2;

        duplicateErrors.push({
          row: rowIndex,
          field: "Matrícula",
          message: `Matrícula ${s.registrationNumber} já existe no sistema`,
        });
        return false;
      }
      return true;
    });

    allErrors.push(...duplicateErrors);

    let created = 0;

    if (newStudents.length > 0) {
      const result = await prisma.user.createMany({
        data: newStudents.map((s) => ({
          role: "STUDENT" as const,
          name: s.name,
          registrationNumber: s.registrationNumber,
          birthDate: s.birthDate,
          schoolId: existingSchool.id,
          municipalityId: existingSchool.municipalityId,
          email: null,
          passwordHash: null,
        })),
        skipDuplicates: true,
      });

      created = result.count;
    }

    const status = allErrors.length > 0 ? 207 : 201;

    return NextResponse.json(
      {
        created,
        total: rawRows.length,
        errors: allErrors,
      },
      { status },
    );
  },
  { allowedRoles: ["ADMIN"] },
);
