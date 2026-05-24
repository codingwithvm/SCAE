"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.activityId as string;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "STUDENT") {
      router.replace("/unauthorized");
      return;
    }

    const token = localStorage.getItem("auth_token");
    fetch("/api/v1/gscae/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ activityId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to start session");
        return res.json();
      })
      .then((data) => {
        setSessionId(data.session.id);
        setHtmlContent(data.htmlContent);
        setLoading(false);
      })
      .catch(() => {
        router.replace("/gscae/activities");
      });
  }, [router, activityId]);

  const handleComplete = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!sessionId || completing) return;
      setCompleting(true);

      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(
          `/api/v1/gscae/sessions/${sessionId}/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          },
        );

        if (res.ok) {
          router.push(`/gscae/sessions/${sessionId}/review`);
        }
      } catch {
        setCompleting(false);
      }
    },
    [sessionId, completing, router],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "SCAE_COMPLETE"
      ) {
        handleComplete(event.data.payload);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [handleComplete]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (completing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
          Salvando seus resultados...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white">
      {htmlContent && (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Atividade G-SCAE"
        />
      )}
    </div>
  );
}
