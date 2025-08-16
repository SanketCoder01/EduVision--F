"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

type Cafe = {
  id: string;
  name: string;
  type: "cafeteria" | "mess" | "cafe_mess";
};

export default function CafeList({ cafeterias, mess }: { cafeterias: Cafe[]; mess: Cafe[] }) {
  const listVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  } as const;

  function List({ items, type }: { items: Cafe[]; type: "cafeteria" | "mess" }) {
    const filtered = items.filter((c) =>
      type === "cafeteria" ? c.type === "cafeteria" : c.type === "mess" || c.type === "cafe_mess"
    );

    return filtered.length === 0 ? (
      <p className="text-sm text-muted-foreground">No {type === "cafeteria" ? "cafeterias" : "mess services"} available.</p>
    ) : (
      <motion.ul variants={listVariants} initial="hidden" animate="show" className="bg-white rounded-lg border divide-y">
        {filtered.map((cafe) => (
          <motion.li key={cafe.id} variants={itemVariants}>
            <Link href={`/dashboard/other-services/cafeterias/${cafe.id}`} className="flex items-center justify-between px-4 py-3 active:scale-[0.995] transition">
              <div>
                <p className="font-medium text-gray-900">{cafe.name}</p>
                {type === "cafeteria" ? (
                  <p className="text-[10px] text-orange-600 font-semibold mt-0.5">CAFETERIA</p>
                ) : (
                  <p className="text-[10px] text-green-600 font-semibold mt-0.5">{cafe.type === "mess" ? "MESS" : "MESS & CAFE"}</p>
                )}
              </div>
              <motion.span
                aria-hidden
                className="text-gray-400"
                initial={{ x: 0 }}
                whileHover={{ x: 2 }}
                whileTap={{ x: 3 }}
                transition={{ type: "tween", duration: 0.15 }}
              >
                ›
              </motion.span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    );
  }

  return (
    <Tabs.Root defaultValue={cafeterias.length ? "cafeteria" : "mess"}>
      <div className="mb-2">
        <Tabs.List className="grid grid-cols-2 gap-2">
          <Tabs.Trigger value="cafeteria" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Cafeteria
          </Tabs.Trigger>
          <Tabs.Trigger value="mess" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Mess
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      <AnimatePresence mode="wait">
        <Tabs.Content value="cafeteria" forceMount>
          <motion.div
            key="cafes"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <List items={cafeterias} type="cafeteria" />
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="mess" forceMount>
          <motion.div
            key="mess"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <List items={mess} type="mess" />
          </motion.div>
        </Tabs.Content>
      </AnimatePresence>
    </Tabs.Root>
  );
}
