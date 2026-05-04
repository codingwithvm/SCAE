"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 10;

interface ClassRow {
  id: string;
  name: string;
  grade: number;
  year: number;
  schoolId: string;
}

interface TeacherOption {
  id: string;
  name: string;
}

export default function SchoolClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  function loadData() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/v1/classes/my", { headers }).then((r) => r.json()),
      fetch("/api/v1/users?role=TEACHER&perPage=100", { headers }).then((r) =>
        r.json(),
      ),
    ])
      .then(([classesRes, teachersRes]) => {
        setClasses(classesRes.classes || []);
        setTeachers(
          (teachersRes.data || []).map((t: { id: string; name: string }) => ({
            id: t.id,
            name: t.name,
          })),
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Turmas
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {classes.length} turmas cadastradas
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar turma..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} aria-hidden="true" />
          Nova turma
        </Button>
      </div>

      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="w-17.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Série
          </span>
          <span className="w-17.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Ano
          </span>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-text-secondary">
              Nenhuma turma encontrada.
            </p>
          </div>
        ) : (
          paginated.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
            >
              <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                {row.name}
              </span>
              <span className="w-17.5 text-sm text-text-secondary font-(family-name:--font-inter)]">
                {row.grade}º
              </span>
              <span className="w-17.5 text-sm text-text-secondary font-(family-name:--font-inter)]">
                {row.year}
              </span>
            </div>
          ))
        )}
      </div>

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
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setPage(pg)}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer",
                  pg === page
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-surface",
                ].join(" ")}
              >
                {pg}
              </button>
            ),
          )}
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

      {showModal && (
        <NewClassModal
          teachers={teachers}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setLoading(true);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function NewClassModal({
  teachers: _teachers,
  onClose,
  onSaved,
}: {
  teachers: TeacherOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name || !grade) return;
    setSaving(true);

    const token = localStorage.getItem("auth_token");
    const stored = localStorage.getItem("auth_user");
    const schoolId = stored
      ? (JSON.parse(stored) as { schoolId?: string }).schoolId
      : null;

    const res = await fetch("/api/v1/classes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        grade: parseInt(grade),
        year: parseInt(year),
        schoolId,
      }),
    });

    if (res.ok) {
      onSaved();
    } else {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col w-120 bg-background rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Nova turma
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <ModalField
            label="Nome da turma"
            placeholder="Ex: Turma A"
            value={name}
            onChange={setName}
          />
          <ModalSelect
            label="Série"
            placeholder="Selecione a série..."
            value={grade}
            onChange={setGrade}
            options={Array.from({ length: 9 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1}º ano`,
            }))}
          />
          <ModalField
            label="Ano letivo"
            placeholder="2026"
            value={year}
            onChange={setYear}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !name || !grade}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
      />
    </div>
  );
}

function ModalSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TeacherOption {
  id: string;
  name: string;
}
