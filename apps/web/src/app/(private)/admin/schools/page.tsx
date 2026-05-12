"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ModalField, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface SchoolRow {
  id: string;
  name: string;
  inepCode: string;
  municipalityId: string;
}

interface MunicipalityOption {
  id: string;
  name: string;
  state: string;
}

export default function AdminSchoolsPage() {
  const router = useRouter();
  const toast = useToast();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<SchoolRow | null>(null);
  const [deleting, setDeleting] = useState<SchoolRow | null>(null);
  const perPage = 20;

  function getToken() {
    return localStorage.getItem("auth_token");
  }

  function loadData(pageNum: number, searchQuery: string) {
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
    if (searchQuery) params.set("search", searchQuery);

    fetch(`/api/v1/schools?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSchools(data.data || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }

  function loadMunicipalities() {
    const token = getToken();
    if (!token) return;

    fetch("/api/v1/municipalities?perPage=200", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMunicipalities(data.data || []));
  }

  useEffect(() => {
    loadData(page, search);
    loadMunicipalities();
  }, [page]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    loadData(1, value);
  }

  function reload() {
    loadData(page, search);
  }

  async function handleDelete(s: SchoolRow) {
    const token = getToken();
    const res = await fetch(`/api/v1/schools/${s.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Escola excluída com sucesso");
      setDeleting(null);
      reload();
    } else {
      const body = await res.json().catch(() => null);
      toast.error(body?.error || "Erro ao excluir escola");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const municipalityMap = new Map(
    municipalities.map((m) => [m.id, `${m.name} (${m.state})`]),
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
            Escolas
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {total} escolas cadastradas
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Nova escola
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
          placeholder="Buscar escola..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
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
              Código INEP
            </span>
            <span className="w-52 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Município
            </span>
            <span className="w-24 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)] text-right">
              Ações
            </span>
          </div>

          {schools.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-text-secondary">
                Nenhuma escola encontrada.
              </p>
            </div>
          ) : (
            schools.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
              >
                <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                  {s.name}
                </span>
                <span className="w-32 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {s.inepCode}
                </span>
                <span className="w-52 text-sm text-text-secondary font-(family-name:--font-inter)] truncate">
                  {municipalityMap.get(s.municipalityId) || "—"}
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
        <SchoolModal
          municipalities={municipalities}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            reload();
          }}
        />
      )}

      {editing && (
        <SchoolModal
          initial={editing}
          municipalities={municipalities}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Excluir escola"
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
            Tem certeza que deseja excluir a escola{" "}
            <strong>{deleting.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  );
}

function SchoolModal({
  initial,
  municipalities,
  onClose,
  onSaved,
}: {
  initial?: SchoolRow;
  municipalities: MunicipalityOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [inepCode, setInepCode] = useState(initial?.inepCode || "");
  const [municipalityId, setMunicipalityId] = useState(
    initial?.municipalityId || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !inepCode || !municipalityId) return;
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("auth_token");
    const url = isEdit ? `/api/v1/schools/${initial.id}` : "/api/v1/schools";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, inepCode, municipalityId }),
    });

    if (res.ok) {
      toast.success(
        isEdit
          ? "Escola atualizada com sucesso"
          : "Escola cadastrada com sucesso",
      );
      onSaved();
    } else {
      const body = await res.json().catch(() => null);
      const msg =
        body?.error === "School with this INEP code already exists"
          ? "Já existe uma escola com este código INEP"
          : body?.error || "Erro ao salvar escola";
      setError(msg);
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar escola" : "Nova escola"}
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
            disabled={saving || !name || !inepCode || !municipalityId}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <ModalField
        label="Nome"
        placeholder="Ex: EMEF João da Silva"
        value={name}
        onChange={setName}
      />
      <ModalField
        label="Código INEP"
        placeholder="Ex: 35000001"
        value={inepCode}
        onChange={setInepCode}
      />
      <ModalSelect
        label="Município"
        placeholder="Selecione o município..."
        value={municipalityId}
        onChange={setMunicipalityId}
        options={municipalities.map((m) => ({
          value: m.id,
          label: `${m.name} (${m.state})`,
        }))}
      />
      {error && (
        <p className="text-sm text-error font-(family-name:--font-inter)]">
          {error}
        </p>
      )}
    </Modal>
  );
}
