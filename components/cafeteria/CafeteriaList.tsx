"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CafeteriaItem = {
  id: string;
  name: string;
  type: "cafeteria" | "mess" | "cafe_mess";
};

type Props = {
  initialItems: CafeteriaItem[];
};

export default function CafeteriaList({ initialItems }: Props) {
  const [tab, setTab] = useState<"cafeteria" | "mess">("cafeteria");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const items = useMemo(() => {
    return initialItems.filter((i) =>
      tab === "cafeteria" ? i.type !== "mess" : i.type !== "cafeteria"
    );
  }, [initialItems, tab]);

  useEffect(() => {
    if (!selectedId) return;
    const supabase = createClient();
    setLoadingDetail(true);

    const load = async () => {
      const [{ data: c }, { data: menu }, { data: mess } ] = await Promise.all([
        supabase.from("cafeterias").select("id,name,type,address,contact_info,images").eq("id", selectedId).single(),
        supabase.from("menu_items").select("id,name,price,description,is_available").eq("cafeteria_id", selectedId).order("name"),
        supabase.from("mess_details").select("one_time_rate,two_time_rate").eq("cafeteria_id", selectedId).maybeSingle(),
      ]);
      setDetail({ cafeteria: c, menu: menu ?? [], mess: mess ?? null });
      setLoadingDetail(false);
    };

    load();
  }, [selectedId]);

  return (
    <div className="max-w-md mx-auto">
      {/* Top Tabs */}
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as any)}>
        <div className="sticky top-0 z-10 -mx-4 px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="pt-1 pb-3">
            <Tabs.List className="grid grid-cols-2 gap-2">
              <Tabs.Trigger
                value="cafeteria"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  tab === "cafeteria" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground/80 border-transparent"
                }`}
              >
                Cafeteria
              </Tabs.Trigger>
              <Tabs.Trigger
                value="mess"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  tab === "mess" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground/80 border-transparent"
                }`}
              >
                Mess
              </Tabs.Trigger>
            </Tabs.List>
          </div>
        </div>

        {/* List showing only name with a View Details button */}
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, delay: idx * 0.02 }}
                className="w-full bg-card border rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/70">
                      {pillForType(item.type, tab)}
                    </span>
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground active:scale-[0.98] transition"
                      onClick={() => setSelectedId(item.id)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              No places found.
            </div>
          )}
        </div>
      </Tabs.Root>

      {/* Detail bottom sheet */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl shadow-xl"
            >
              <div className="h-1.5 w-10 bg-muted rounded-full mx-auto mt-2" />
              <div className="p-4 space-y-3 max-h-[70dvh] overflow-y-auto">
                {loadingDetail || !detail ? (
                  <SheetSkeleton />
                ) : (
                  <DetailView detail={detail} onClose={() => setSelectedId(null)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function pillForType(type: CafeteriaItem["type"], tab: "cafeteria" | "mess") {
  if (type === "cafe_mess") return tab === "cafeteria" ? "Cafe" : "Mess";
  if (type === "cafeteria") return "Cafe";
  return "Mess";
}

function SheetSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-40 bg-muted rounded" />
      <div className="h-4 w-56 bg-muted rounded" />
      <div className="h-4 w-48 bg-muted rounded" />
      <div className="h-32 w-full bg-muted rounded-xl" />
      <div className="h-5 w-32 bg-muted rounded" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}

function DetailView({ detail, onClose }: { detail: any; onClose: () => void }) {
  const c = detail.cafeteria as {
    id: string;
    name: string;
    type: CafeteriaItem["type"];
    address?: string | null;
    contact_info?: string | null;
    images?: string[] | null;
  };
  const menu = (detail.menu as any[]) || [];
  const mess = detail.mess as { one_time_rate?: string | null; two_time_rate?: string | null } | null;

  return (
    <div className="space-y-4">
      {/* Header with name */}
      <div className="flex items-start justify-between gap-3 sticky top-0 bg-background pt-1 pb-2">
        <div>
          <h3 className="text-lg font-semibold">{c.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {c.type === "cafeteria" ? "Cafeteria" : c.type === "mess" ? "Mess" : "Cafeteria & Mess"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-sm px-3 py-1.5 rounded-lg bg-muted"
        >
          Close
        </button>
      </div>

      {/* Tabs for Info / Images / Prices */}
      <Tabs.Root defaultValue="info">
        <div className="mb-3">
          <Tabs.List className="grid grid-cols-3 gap-2">
            <Tabs.Trigger value="info" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Info
            </Tabs.Trigger>
            <Tabs.Trigger value="images" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Images
            </Tabs.Trigger>
            <Tabs.Trigger value="prices" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Prices
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content value="info" className="space-y-2">
          {c.address ? (
            <p className="text-sm"><span className="font-medium">Address:</span> {c.address}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No address provided.</p>
          )}
          {c.contact_info ? (
            <p className="text-sm"><span className="font-medium">Contact:</span> {c.contact_info}</p>
          ) : null}
        </Tabs.Content>

        <Tabs.Content value="images">
          {c.images?.length ? (
            <div className="flex gap-2 overflow-x-auto snap-x">
              {c.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Image"
                  className="h-28 w-44 object-cover rounded-xl snap-center"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No images available.</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="prices" className="space-y-3">
          {mess && (
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-sm font-medium mb-1">Mess Rates</p>
              <div className="flex items-center justify-between text-sm">
                <span>One time</span>
                <span className="font-semibold">{formatCurrency(mess.one_time_rate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Two time</span>
                <span className="font-semibold">{formatCurrency(mess.two_time_rate)}</span>
              </div>
            </div>
          )}

          {menu.length > 0 ? (
            <div>
              <p className="text-sm font-medium mb-2">Menu</p>
              <div className="space-y-2">
                {menu.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-card border rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      {m.description ? (
                        <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(m.price)}</p>
                      {!m.is_available && (
                        <p className="text-[10px] text-muted-foreground">Unavailable</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No menu items available.</p>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function formatCurrency(v?: string | number | null) {
  if (v === null || v === undefined || v === "") return "-";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(num)) return String(v);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
}
