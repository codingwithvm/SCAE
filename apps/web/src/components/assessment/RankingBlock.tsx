"use client";

import type { Dimension } from "@/lib/assessment/types";

interface RankingItem {
  dimension: Dimension;
  text: string;
}

interface RankingBlockProps {
  items: RankingItem[];
  mode: "sequential" | "matrix";
  ranks: Record<Dimension, number | null>;
  onRankChange: (ranks: Record<Dimension, number | null>) => void;
}

const RANK_LABELS: Record<number, string> = {
  1: "Menos parecido",
  2: "Pouco parecido",
  3: "Parecido",
  4: "Mais parecido",
};

export function RankingBlock({
  items,
  mode,
  ranks,
  onRankChange,
}: RankingBlockProps) {
  if (mode === "sequential") {
    return (
      <SequentialRanking
        items={items}
        ranks={ranks}
        onRankChange={onRankChange}
      />
    );
  }

  return (
    <MatrixRanking items={items} ranks={ranks} onRankChange={onRankChange} />
  );
}

function SequentialRanking({
  items,
  ranks,
  onRankChange,
}: Omit<RankingBlockProps, "mode">) {
  const assignedCount = Object.values(ranks).filter((r) => r !== null).length;

  function handleItemClick(dimension: Dimension) {
    const currentRank = ranks[dimension];

    if (currentRank !== null) {
      const updatedRanks = { ...ranks, [dimension]: null };

      for (const item of items) {
        const d = item.dimension;
        const r = updatedRanks[d];
        if (r !== null && r > currentRank) {
          updatedRanks[d] = r - 1;
        }
      }

      onRankChange(updatedRanks);
      return;
    }

    if (assignedCount >= 4) return;

    const nextRank = assignedCount + 1;
    onRankChange({ ...ranks, [dimension]: nextRank });
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const rank = ranks[item.dimension];
        const isRanked = rank !== null;

        return (
          <button
            key={item.dimension}
            type="button"
            onClick={() => handleItemClick(item.dimension)}
            className={[
              "flex items-center gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-colors cursor-pointer",
              isRanked
                ? "bg-[#EDF9F5] border-cta border-2"
                : "bg-background border-border hover:border-border-light",
            ].join(" ")}
          >
            {isRanked ? (
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-cta text-white">
                {rank}
              </div>
            ) : (
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface border border-border" />
            )}

            <span
              className={[
                "text-base font-(family-name:--font-inter)] text-text-primary leading-relaxed flex-1",
                isRanked ? "font-medium" : "font-normal",
              ].join(" ")}
            >
              {item.text}
            </span>

            {isRanked && (
              <span className="shrink-0 text-xs font-medium text-cta-dark font-(family-name:--font-inter)]">
                {RANK_LABELS[rank!]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MatrixRanking({
  items,
  ranks,
  onRankChange,
}: Omit<RankingBlockProps, "mode">) {
  function handleRankSelect(dimension: Dimension, rank: number) {
    const updatedRanks = { ...ranks };

    const previousHolder = items.find(
      (item) =>
        item.dimension !== dimension && updatedRanks[item.dimension] === rank,
    );
    if (previousHolder) {
      updatedRanks[previousHolder.dimension] = null;
    }

    updatedRanks[dimension] = rank;
    onRankChange(updatedRanks);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="pb-3 text-left text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
              Afirmação
            </th>
            {[4, 3, 2, 1].map((rank) => (
              <th
                key={rank}
                className="w-16 pb-3 text-center text-sm font-medium text-text-secondary font-(family-name:--font-inter)]"
              >
                {rank === 4 ? "4 (Mais)" : rank === 1 ? "1 (Menos)" : rank}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.dimension} className="border-t border-border-light">
              <td className="py-4 pr-4 text-sm text-text-primary font-(family-name:--font-inter)]">
                {item.text}
              </td>
              {[4, 3, 2, 1].map((rank) => {
                const isSelected = ranks[item.dimension] === rank;

                return (
                  <td key={rank} className="py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleRankSelect(item.dimension, rank)}
                      className={[
                        "h-9 w-9 rounded-full border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-cta bg-cta text-white"
                          : "border-border bg-background hover:border-primary",
                      ].join(" ")}
                    >
                      {isSelected && (
                        <span className="text-xs font-bold">{rank}</span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
