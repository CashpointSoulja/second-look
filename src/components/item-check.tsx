"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Photo } from "./photo";
import { GradeChip, VerdictBadge } from "./ui";
import { gbp, GRADE_FACTOR } from "@/lib/refund";
import type { DefectStatus, Item } from "@/lib/types";

const STATUS: Record<DefectStatus, { label: string; color: string; chip: string }> = {
  NEW: { label: "New", color: "text-below", chip: "bg-below text-white" },
  WORSENED: { label: "Worse than listed", color: "text-review", chip: "bg-review text-white" },
  DISCLOSED: { label: "Disclosed in listing", color: "text-sky-500", chip: "bg-sky-500 text-white" },
};

const MIN_SCAN_MS = 2400; // long enough to read the scan, short enough to feel instant

async function toJpeg(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.85));
}

export function ItemCheck({ item: initial, locked }: { item: Item; locked: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [item, setItem] = useState(initial);
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">(initial.verdict ? "done" : "idle");
  const [preview, setPreview] = useState<string | null>(initial.received_photo_url);
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(body: FormData, localPreview: string) {
    setError(null);
    setPreview(localPreview);
    setPhase("scanning");
    const started = Date.now();
    try {
      const res = await fetch(`/api/items/${item.id}/verify`, { method: "POST", body });
      const json = await res.json();
      await new Promise((r) => setTimeout(r, Math.max(0, MIN_SCAN_MS - (Date.now() - started))));
      if (!res.ok) throw new Error(json.error ?? "Verification failed");
      setItem(json.item);
      setPhase("done");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase(item.verdict ? "done" : "idle");
      setPreview(item.received_photo_url);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const jpeg = await toJpeg(file).catch(() => file);
    const fd = new FormData();
    fd.append("photo", new File([jpeg], "arrival.jpg", { type: "image/jpeg" }));
    run(fd, URL.createObjectURL(jpeg));
  }

  function pickSample() {
    const fd = new FormData();
    fd.append("demo", "1");
    run(fd, item.demo_arrival_url!);
  }

  const done = phase === "done" && item.verdict;
  const defects = done ? item.defects : [];

  return (
    <article className="overflow-hidden rounded-card border border-line bg-white">
      <header className="flex items-center justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-subtle">Piece {item.position}</p>
          <h3 className="font-bold leading-snug">{item.name}</h3>
        </div>
        <div className="text-right">
          <GradeChip grade={item.claimed_grade} label="Listed" />
          <p className="mt-1 text-xs font-semibold text-muted">{gbp(item.unit_price_gbp)}/pc</p>
        </div>
      </header>

      <div className={`grid gap-2 p-4 ${compare || phase === "idle" ? "grid-cols-2" : "grid-cols-1"}`}>
        {(compare || phase === "idle") && (
          <figure className="space-y-1.5">
            <Photo src={item.listing_photo_url} alt={`Listing photo: ${item.name}`} className="aspect-square w-full rounded-xl" />
            <figcaption className="text-[11px] font-semibold text-muted">Listing photo</figcaption>
          </figure>
        )}
        {phase === "idle" ? (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-canvas p-3 text-center">
            {locked ? (
              <p className="text-xs font-semibold text-muted">Not checked</p>
            ) : (
              <>
                <button
                  onClick={() => input.current?.click()}
                  className="w-full rounded-xl bg-fleek px-3 py-3 text-sm font-bold text-ink shadow-sm transition hover:bg-fleek-dark active:scale-95"
                >
                  Upload received photo
                </button>
                {item.demo_arrival_url && (
                  <button onClick={pickSample} className="text-xs font-semibold text-muted underline underline-offset-2 hover:text-ink">
                    or use the sample arrival photo
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <figure className="space-y-1.5">
            <div className="scan-frame aspect-square w-full rounded-xl">
              <Photo src={preview} alt={`Arrival photo: ${item.name}`} className="absolute inset-0 h-full w-full" />
              {phase === "scanning" && (
                <>
                  <div className="scan-dim" />
                  <div className="scan-grid" />
                  <div className="scan-line" />
                  <p className="absolute inset-x-0 bottom-3 text-center text-xs font-bold text-white drop-shadow">Scanning for stains, holes, pilling, damage…</p>
                </>
              )}
              {defects.map((d, i) => (
                <div
                  key={i}
                  className={`defect-box ${STATUS[d.status].color}`}
                  style={{
                    left: `${d.bbox[0] * 100}%`,
                    top: `${d.bbox[1] * 100}%`,
                    width: `${Math.max(d.bbox[2], 0.05) * 100}%`,
                    height: `${Math.max(d.bbox[3], 0.05) * 100}%`,
                    animationDelay: `${i * 220}ms`,
                  }}
                >
                  <span className={`absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${STATUS[d.status].chip}`}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="text-[11px] font-semibold text-muted">{phase === "scanning" ? "Arrival photo · scanning" : "Arrival photo · areas flagged for review"}</figcaption>
          </figure>
        )}
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="mx-4 mb-3 rounded-lg bg-below-soft px-3 py-2 text-sm font-medium text-below">{error}</p>}

      {done && item.verdict && (
        <div className="space-y-3 border-t border-line px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <VerdictBadge verdict={item.verdict} />
            {item.true_grade && <GradeChip grade={item.true_grade} label="Arrived" />}
            <span className="text-xs font-semibold text-muted">{Math.round((item.confidence ?? 0) * 100)}% confidence</span>
          </div>
          <p className="text-sm leading-relaxed">{item.agent_reason}</p>

          {defects.length > 0 && (
            <ol className="space-y-1.5">
              {defects.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${STATUS[d.status].chip}`}>{i + 1}</span>
                  <span>
                    <span className="font-semibold capitalize">{d.type}</span> · {d.note}
                    <span className={`ml-1.5 text-xs font-bold ${STATUS[d.status].color}`}>{STATUS[d.status].label}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}

          {item.verdict === "BELOW_GRADE" && item.true_grade && (
            <div className="flex items-center justify-between rounded-xl bg-below-soft px-3 py-2.5 text-sm">
              <span className="text-muted">
                {gbp(item.unit_price_gbp)} × (1 − {GRADE_FACTOR[item.true_grade]}/{GRADE_FACTOR[item.claimed_grade]})
              </span>
              <span className="font-extrabold text-below">{gbp(item.refund_gbp ?? 0)} to reclaim</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
            <button onClick={() => setCompare((c) => !c)} className="text-ink underline underline-offset-2">
              {compare ? "Hide listing" : "Compare with listing"}
            </button>
            {!locked && (
              <button onClick={() => input.current?.click()} className="text-muted underline underline-offset-2 hover:text-ink">
                Re-scan with a new photo
              </button>
            )}
            <span className="ml-auto text-subtle">{item.source === "scripted" ? "Scripted demo verdict (AI not connected)" : "AI verdict · review before sending"}</span>
          </div>
          {compare && item.listing_defects.length > 0 && (
            <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-muted">
              <span className="font-bold text-ink">Supplier disclosed: </span>
              {item.listing_defects.map((d) => d.note).join("; ")}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
