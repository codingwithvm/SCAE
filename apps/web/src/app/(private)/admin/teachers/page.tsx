"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ModalField, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface TeacherRow {
  id: string;
  name: string;
  email: string | null;
  schoolId: string | null;
  createdAt: string;
}

interface SchoolOption {
  id: string;
  name: string;
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const toast = useToast();
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<TeacherRow | null>(null);
  const [deleting, setDeleting] = useState<TeacherRow | null>(null);

  function getToken() {
    return localStorage.getItem("auth_token");
  }

  function fetchTeachers() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/v1/users?role=TEACHER&perPage=200", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const rows = (data.data || []) as TeacherRow[];
        rows.sort(
          (a: TeacherRow, b: TeacherRow) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTeachers(rows);
      })
      .finally(() => setLoading(false));
  }

  function fetchSchools() {
    const token = getToken();
    if (!token) return;

    fetch("/api/v1/schools?perPage=200", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSchools(data.data || []));
  }

  useEffect(() => {
    fetchTeachers();
    fetchSchools();
  }, []);

  async function handleDelete(t: TeacherRow) {
    const token = getToken();
    const res = await fetch(`/api/v1/users/${t.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Professor excluído com sucesso");
      setDeleting(null);
      setLoading(true);
      fetchTeachers();
    } else {
      const body = await res.json().catch(() => null);
      toast.error(body?.error || "Erro ao excluir professor");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));

  const filtered = teachers.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      (t.schoolId
        ? (schoolMap.get(t.schoolId) || "").toLowerCase()
        : ""
      ).includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
            Professores
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {teachers.length} professores cadastrados
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Novo professor
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
          placeholder="Buscar professor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
        />
      </div>

      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="w-52 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Email
          </span>
          <span className="w-44 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Escola
          </span>
          <span className="w-28 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Status
          </span>
          <span className="w-24 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)] text-right">
            Ações
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-text-secondary">
              Nenhum professor encontrado.
            </p>
          </div>
        ) : (
          filtered.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
            >
              <div className="flex items-center gap-2.5 flex-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shrink-0">
                  <span className="text-xs font-semibold text-white">
                    {teacher.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                  {teacher.name}
                </span>
              </div>
              <span className="w-52 text-sm text-text-secondary font-(family-name:--font-inter)] truncate">
                {teacher.email || "—"}
              </span>
              <span className="w-44 text-sm text-text-secondary font-(family-name:--font-inter)] truncate">
                {teacher.schoolId
                  ? schoolMap.get(teacher.schoolId) || "—"
                  : "—"}
              </span>
              <div className="w-28">
                <Badge variant="success">Ativo</Badge>
              </div>
              <div className="w-24 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(teacher)}
                  className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(teacher)}
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

      {showCreate && (
        <TeacherModal
          schools={schools}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            setLoading(true);
            fetchTeachers();
          }}
        />
      )}

      {editing && (
        <TeacherModal
          initial={editing}
          schools={schools}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setLoading(true);
            fetchTeachers();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Excluir professor"
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
            Tem certeza que deseja excluir o professor{" "}
            <strong>{deleting.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  );
}

function TeacherModal({
  initial,
  schools,
  onClose,
  onSaved,
}: {
  initial?: TeacherRow;
  schools: SchoolOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState(initial?.schoolId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !email || (!isEdit && !password)) return;
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("auth_token");

    if (isEdit) {
      const body: Record<string, string> = { name, email };
      if (password) body.password = password;
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
        toast.success("Professor atualizado com sucesso");
        onSaved();
      } else {
        const resBody = await res.json().catch(() => null);
        setError(resBody?.error || "Erro ao atualizar professor");
        setSaving(false);
      }
    } else {
      const body: Record<string, string> = {
        role: "TEACHER",
        name,
        email,
        password,
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
        toast.success("Professor cadastrado com sucesso");
        onSaved();
      } else {
        const resBody = await res.json().catch(() => null);
        const msg =
          resBody?.error === "User with this email already exists"
            ? "Já existe um usuário com este email"
            : resBody?.error || "Erro ao cadastrar professor";
        setError(msg);
        setSaving(false);
      }
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar professor" : "Novo professor"}
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
            disabled={saving || !name || !email || (!isEdit && !password)}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <ModalField
        label="Nome completo"
        placeholder="Ex: Maria da Silva"
        value={name}
        onChange={setName}
      />
      <ModalField
        label="Email"
        placeholder="professor@escola.edu.br"
        value={email}
        onChange={setEmail}
        type="email"
      />
      <ModalField
        label={isEdit ? "Nova senha (deixe em branco para manter)" : "Senha"}
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={setPassword}
        type="password"
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
