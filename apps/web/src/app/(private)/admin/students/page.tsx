"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ModalField, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface StudentRow {
  id: string;
  name: string;
  registrationNumber: string | null;
  birthDate: string | null;
  schoolId: string | null;
  createdAt: string;
}

interface SchoolOption {
  id: string;
  name: string;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const toast = useToast();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [deleting, setDeleting] = useState<StudentRow | null>(null);
  const [showImport, setShowImport] = useState(false);
  const perPage = 20;

  function getToken() {
    return localStorage.getItem("auth_token");
  }

  function loadData(pageNum: number) {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      role: "STUDENT",
      page: String(pageNum),
      perPage: String(perPage),
    });

    fetch(`/api/v1/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStudents(data.data || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }

  function loadSchools() {
    const token = getToken();
    if (!token) return;

    fetch("/api/v1/schools?perPage=200", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSchools(data.data || []));
  }

  useEffect(() => {
    loadData(page);
    loadSchools();
  }, [page]);

  function reload() {
    loadData(page);
  }

  async function handleDelete(s: StudentRow) {
    const token = getToken();
    const res = await fetch(`/api/v1/users/${s.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Aluno excluído com sucesso");
      setDeleting(null);
      reload();
    } else {
      const body = await res.json().catch(() => null);
      toast.error(body?.error || "Erro ao excluir aluno");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.registrationNumber || "").toLowerCase().includes(q)
    );
  });

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
            Alunos
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {total} alunos cadastrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
          >
            <Upload size={16} />
            Importar planilha
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            Novo aluno
          </Button>
        </div>
      </div>

      <div className="relative w-80">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar aluno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border border-border-light bg-background overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface">
            <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Nome
            </span>
            <span className="w-32 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Matrícula
            </span>
            <span className="w-32 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Nascimento
            </span>
            <span className="w-44 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Escola
            </span>
            <span className="w-24 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)] text-right">
              Ações
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-text-secondary">
                Nenhum aluno encontrado.
              </p>
            </div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shrink-0">
                    <span className="text-xs font-semibold text-white">
                      {s.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                    {s.name}
                  </span>
                </div>
                <span className="w-32 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {s.registrationNumber || "—"}
                </span>
                <span className="w-32 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {formatDate(s.birthDate)}
                </span>
                <span className="w-44 text-sm text-text-secondary font-(family-name:--font-inter)] truncate">
                  {s.schoolId ? schoolMap.get(s.schoolId) || "—" : "—"}
                </span>
                <div className="w-24 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(s)}
                    className="p-1.5 rounded text-text-secondary hover:text-error hover:bg-surface transition-colors cursor-pointer"
                    aria-label="Excluir"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-text-secondary">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {showCreate && (
        <StudentModal
          schools={schools}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            reload();
          }}
        />
      )}

      {editing && (
        <StudentModal
          initial={editing}
          schools={schools}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Excluir aluno"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleting(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleting)}
              >
                Excluir
              </Button>
            </>
          }
        >
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Tem certeza que deseja excluir o aluno{" "}
            <strong>{deleting.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}

      {showImport && (
        <ImportModal
          schools={schools}
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function StudentModal({
  initial,
  schools,
  onClose,
  onSaved,
}: {
  initial?: StudentRow;
  schools: SchoolOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [registrationNumber, setRegistrationNumber] = useState(
    initial?.registrationNumber || "",
  );
  const [birthDate, setBirthDate] = useState(
    initial?.birthDate ? initial.birthDate.split("T")[0] : "",
  );
  const [schoolId, setSchoolId] = useState(initial?.schoolId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !registrationNumber || !birthDate) return;
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("auth_token");

    if (isEdit) {
      const body: Record<string, unknown> = {
        name,
        registrationNumber,
        birthDate,
      };
      if (schoolId) body.schoolId = schoolId;

      const res = await fetch(`/api/v1/users/${initial.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Aluno atualizado com sucesso");
        onSaved();
      } else {
        const resBody = await res.json().catch(() => null);
        setError(resBody?.error || "Erro ao atualizar aluno");
        setSaving(false);
      }
    } else {
      const body: Record<string, unknown> = {
        role: "STUDENT",
        name,
        registrationNumber,
        birthDate,
      };
      if (schoolId) body.schoolId = schoolId;

      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Aluno cadastrado com sucesso");
        onSaved();
      } else {
        const resBody = await res.json().catch(() => null);
        const msg =
          resBody?.error === "User with this registration number already exists"
            ? "Já existe um aluno com esta matrícula"
            : resBody?.error || "Erro ao cadastrar aluno";
        setError(msg);
        setSaving(false);
      }
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar aluno" : "Novo aluno"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !name || !registrationNumber || !birthDate}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <ModalField
        label="Nome completo"
        placeholder="Ex: João da Silva"
        value={name}
        onChange={setName}
      />
      <ModalField
        label="Matrícula"
        placeholder="Ex: 2026101"
        value={registrationNumber}
        onChange={setRegistrationNumber}
      />
      <ModalField
        label="Data de nascimento"
        placeholder="AAAA-MM-DD"
        value={birthDate}
        onChange={setBirthDate}
        type="date"
      />
      <ModalSelect
        label="Escola (opcional)"
        placeholder="Selecione a escola..."
        value={schoolId}
        onChange={setSchoolId}
        options={schools.map((s) => ({ value: s.id, label: s.name }))}
      />
      {error && (
        <p className="text-sm text-error font-(family-name:--font-inter)]">
          {error}
        </p>
      )}
    </Modal>
  );
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

function ImportModal({
  schools,
  onClose,
  onImported,
}: {
  schools: SchoolOption[];
  onClose: () => void;
  onImported: () => void;
}) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [schoolId, setSchoolId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    total: number;
    errors: ImportError[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }

  async function handleDownloadTemplate() {
    const token = localStorage.getItem("auth_token");

    const res = await fetch("/api/v1/users/import/template", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Erro ao baixar modelo");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_alunos.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload() {
    if (!selectedFile || !schoolId) return;
    setUploading(true);
    setError(null);
    setResult(null);

    const token = localStorage.getItem("auth_token");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("schoolId", schoolId);

    const res = await fetch("/api/v1/users/import", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const body = await res.json().catch(() => null);

    if (res.status === 201 || res.status === 207) {
      setResult(body);
      if (body.created > 0) {
        toast.success(`${body.created} aluno(s) importado(s) com sucesso`);
      }
    } else {
      if (body?.errors && body.errors.length > 0) {
        setResult(body);
      } else {
        setError(body?.error || "Erro ao importar planilha");
      }
    }

    setUploading(false);
  }

  const hasResult = result !== null;
  const hasErrors = result && result.errors.length > 0;

  return (
    <Modal
      title="Importar alunos via planilha"
      onClose={onClose}
      footer={
        hasResult && result.created > 0 ? (
          <Button variant="primary" size="sm" onClick={onImported}>
            Fechar
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !schoolId}
            >
              {uploading ? "Importando..." : "Importar"}
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-border-light bg-surface px-4 py-3">
          <FileSpreadsheet size={20} className="text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
              Modelo de planilha
            </p>
            <p className="text-xs text-text-secondary font-(family-name:--font-inter)]">
              Baixe o modelo com as colunas: Nome, Matrícula, Data de Nascimento
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Download size={14} />
            Baixar
          </button>
        </div>

        <ModalSelect
          label="Escola"
          placeholder="Selecione a escola..."
          value={schoolId}
          onChange={(v) => {
            setSchoolId(v);
            setResult(null);
            setError(null);
          }}
          options={schools.map((s) => ({ value: s.id, label: s.name }))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
            Arquivo Excel
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 h-20 rounded-md border-2 border-dashed border-border bg-surface/50 text-sm text-text-secondary hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Upload size={16} />
            {selectedFile ? selectedFile.name : "Clique para selecionar .xlsx"}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2.5">
            <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error font-(family-name:--font-inter)]">
              {error}
            </p>
          </div>
        )}

        {hasResult && (
          <div className="flex flex-col gap-3">
            {result.created > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-(family-name:--font-inter)]">
                  {result.created} de {result.total} aluno(s) importado(s) com
                  sucesso
                </p>
              </div>
            )}

            {hasErrors && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-error font-(family-name:--font-inter)]">
                  {result.errors.length} erro(s) encontrado(s):
                </p>
                <div className="max-h-40 overflow-y-auto rounded-md border border-error/20 bg-error/5">
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 border-b border-error/10 last:border-b-0"
                    >
                      <span className="text-xs font-mono text-error/70 shrink-0 mt-0.5">
                        Linha {err.row}
                      </span>
                      <span className="text-xs text-error font-(family-name:--font-inter)]">
                        {err.field}: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
