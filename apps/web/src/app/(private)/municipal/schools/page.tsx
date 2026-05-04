"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface SchoolRow {
  id: string;
  name: string;
  inepCode: string;
}

export default function MunicipalSchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const params = new URLSearchParams({ perPage: "100" });
    if (search) params.set("search", search);

    fetch(`/api/v1/schools?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSchools(data.data || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [router, search]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Escolas
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {total} escolas no município
        </p>
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
            <span className="flex-1 text-xs font-semibold text-text-secondary">
              Nome
            </span>
            <span className="w-32 text-xs font-semibold text-text-secondary">
              INEP
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
                <span className="flex-1 text-sm font-medium text-text-primary">
                  {s.name}
                </span>
                <span className="w-32 text-sm text-text-secondary">
                  {s.inepCode}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
