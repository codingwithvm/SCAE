"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ModalField, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface ClassRow {
  id: string;
  name: string;
  grade: number;
  year: number;
  schoolId: string;
}

interface SchoolOption {
  id: string;
  name: string;
}

export default function AdminClassesPage() {
  const router = useRouter();
  const toast = useToast();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [deleting, setDeleting] = useState<ClassRow | null>(null);
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
      page: String(pageNum),
      perPage: String(perPage),
    });

    fetch(`/api/v1/classes?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setClasses(data.data || []);
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

  async function handleDelete(c: ClassRow) {
    const token = getToken();
    const res = await fetch(`/api/v1/classes/${c.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Turma excluída com sucesso");
      setDeleting(null);
      reload();
    } else {
      const body = await res.json().catch(() => null);
      toast.error(body?.error || "Erro ao excluir turma");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));

  const filtered = classes.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (schoolMap.get(c.schoolId) || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
            Turmas
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {total} turmas cadastradas
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Nova turma
        </Button>
      </div>

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
            <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Série
            </span>
            <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Ano
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
                Nenhuma turma encontrada.
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
              >
                <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                  {c.name}
                </span>
                <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {c.grade}º ano
                </span>
                <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {c.year}
                </span>
                <span className="w-44 text-sm text-text-secondary font-(family-name:--font-inter)] truncate">
                  {schoolMap.get(c.schoolId) || "—"}
                </span>
                <div className="w-24 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(c)}
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
        <ClassModal
          schools={schools}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            reload();
          }}
        />
      )}

      {editing && (
        <ClassModal
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
          title="Excluir turma"
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
            Tem certeza que deseja excluir a turma{" "}
            <strong>{deleting.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  );
}

function ClassModal({
  initial,
  schools,
  onClose,
  onSaved,
}: {
  initial?: ClassRow;
  schools: SchoolOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [grade, setGrade] = useState(initial ? String(initial.grade) : "");
  const [year, setYear] = useState(
    initial ? String(initial.year) : String(new Date().getFullYear()),
  );
  const [schoolId, setSchoolId] = useState(initial?.schoolId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !grade || !year || !schoolId) return;
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("auth_token");
    const url = isEdit ? `/api/v1/classes/${initial.id}` : "/api/v1/classes";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
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
      toast.success(
        isEdit
          ? "Turma atualizada com sucesso"
          : "Turma cadastrada com sucesso",
      );
      onSaved();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Erro ao salvar turma");
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar turma" : "Nova turma"}
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
            disabled={saving || !name || !grade || !year || !schoolId}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <ModalField
        label="Nome da turma"
        placeholder="Ex: 1º Ano A"
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
      <ModalSelect
        label="Escola"
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
