"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MunicipalityRow {
  id: string;
  name: string;
  state: string;
  ibgeCode: string;
}

export default function AdminMunicipalitiesPage() {
  const router = useRouter();
  const [municipalities, setMunicipalities] = useState<MunicipalityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 20;

  function loadData(pageNum: number, searchQuery: string) {
    const token = localStorage.getItem("auth_token");
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

    fetch(`/api/v1/municipalities?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setMunicipalities(data.data || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData(page, search);
  }, [page]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    loadData(1, value);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Municípios
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {total} municípios cadastrados
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
          placeholder="Buscar município..."
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
            <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              UF
            </span>
            <span className="w-32 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Código IBGE
            </span>
          </div>

          {municipalities.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-text-secondary">
                Nenhum município encontrado.
              </p>
            </div>
          ) : (
            municipalities.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
              >
                <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                  {m.name}
                </span>
                <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {m.state}
                </span>
                <span className="w-32 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {m.ibgeCode}
                </span>
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
    </div>
  );
}
