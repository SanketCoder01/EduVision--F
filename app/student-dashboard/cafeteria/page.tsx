import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";

const CafeteriaList = dynamic(() => import("@/components/cafeteria/CafeteriaList"), {
  ssr: false,
});

export const revalidate = 0;

export default async function CafeteriaPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("cafeterias")
    .select("id, name, type")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    // Render empty state; the component will handle empty list gracefully
    return <CafeteriaList initialItems={[]} />;
  }

  return (
    <CafeteriaList
      initialItems={(data ?? []).map((d) => ({
        id: d.id as string,
        name: d.name as string,
        type: d.type as "cafeteria" | "mess" | "cafe_mess",
      }))}
    />
  );
}
