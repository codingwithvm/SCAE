"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ModalField } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface TeacherRow {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
}

export default function SchoolTeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  function getToken() {
    return localStorage.getItem("auth_token");
  }

  function fetchTeachers() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/v1/users?role=TEACHER&perPage=100", {
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

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const filtered = teachers.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q)
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
            {teachers.length} professores vinculados
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
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
          <span className="w-60 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Email
          </span>
          <span className="w-28 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Status
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
              <span className="w-60 text-sm text-text-secondary font-(family-name:--font-inter)] truncate">
                {teacher.email || "—"}
              </span>
              <div className="w-28">
                <Badge variant="success">Ativo</Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <NewTeacherModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setLoading(true);
            fetchTeachers();
          }}
        />
      )}
    </div>
  );
}

function NewTeacherModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !email || !password) return;
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("auth_token");

    const res = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "TEACHER",
        name,
        email,
        password,
      }),
    });

    if (res.ok) {
      toast.success("Professor cadastrado com sucesso");
      onSaved();
    } else {
      const body = await res.json().catch(() => null);
      const msg =
        body?.error === "User with this email already exists"
          ? "Já existe um usuário com este email"
          : body?.error || "Erro ao cadastrar professor";
      setError(msg);
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Novo professor"
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
            disabled={saving || !name || !email || !password}
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
        label="Senha"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={setPassword}
        type="password"
      />
      {error && (
        <p className="text-sm text-error font-(family-name:--font-inter)]">
          {error}
        </p>
      )}
    </Modal>
  );
}
