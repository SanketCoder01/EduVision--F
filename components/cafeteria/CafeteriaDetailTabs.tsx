"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Cafe = {
  id: string;
  name: string;
  type: "cafeteria" | "mess" | "cafe_mess";
  address?: string | null;
  contact_info?: string | null;
  images?: string[] | null;
  menu_items?: Array<{ id: string; name: string; price: number | string; description?: string | null; is_available?: boolean | null }>;
  mess_details?: { one_time_rate?: string | number | null; two_time_rate?: string | number | null } | null;
};

export default function CafeteriaDetailTabs({ cafe }: { cafe: Cafe }) {
  const [activeTab, setActiveTab] = useState("info");

  const tabContentVariants: import("framer-motion").Variants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, x: -15, transition: { duration: 0.25, ease: "easeIn" } },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{cafe.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">{cafe.type.replace('_', ' ')}</p>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Triggers */}
        <div className="mb-4">
          <Tabs.List className="grid w-full grid-cols-3 gap-2">
            <Tabs.Trigger value="info" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors">
              Info
            </Tabs.Trigger>
            <Tabs.Trigger value="images" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors">
              Images
            </Tabs.Trigger>
            <Tabs.Trigger value="menu" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors">
              Menu
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {activeTab === 'info' && (
              <div className="space-y-3">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="border-b p-4"><h2 className="font-semibold">Type</h2></div>
                  <div className="p-4 text-sm"><p className="font-medium capitalize">{cafe.type.replace('_', ' ')}</p></div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="border-b p-4"><h2 className="font-semibold">Address</h2></div>
                  <div className="p-4 text-sm"><p className="font-medium">{cafe.address || '—'}</p></div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="border-b p-4"><h2 className="font-semibold">Contact</h2></div>
                  <div className="p-4 text-sm"><p className="font-medium">{cafe.contact_info || '—'}</p></div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="border-b p-4"><h2 className="font-semibold">Images</h2></div>
                <div className="p-4">
                  {cafe.images && cafe.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {cafe.images.map((src, i) => <img key={i} src={src} alt={`Image ${i + 1}`} className="h-28 w-full object-cover rounded-md" />)}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No images uploaded yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="border-b p-4"><h2 className="font-semibold">Menu</h2></div>
                <div className="p-4">
                  {cafe.menu_items && cafe.menu_items.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupMenuItems(cafe.menu_items)).map(([category, items]) => (
                        <div key={category}>
                          <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-2">{category}</h3>
                          <div className="divide-y">
                            {items.map((item) => (
                              <div key={item.id} className="py-3 flex items-start justify-between text-sm">
                                <div className="pr-2">
                                  <p className="font-medium">{item.name}</p>
                                  {item.description && <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>}
                                </div>
                                <div className="font-semibold whitespace-nowrap">{formatCurrency(item.price)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No menu items added yet.</p>}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs.Root>
    </div>
  );
}

const groupMenuItems = (items: NonNullable<Cafe['menu_items']>) => {
  const categories: Record<string, NonNullable<Cafe['menu_items']>> = {
    'Main Course': [],
    'Snacks': [],
    'Drinks': [],
    'Sweets': [],
    'Other': [],
  };

  const keywords: Record<string, (keyof typeof categories)[]> = {
    'thali': ['Main Course'], 'meal': ['Main Course'], 'dal rice': ['Main Course'], 'rajma chawal': ['Main Course'], 'chole bhature': ['Main Course'], 'paratha': ['Main Course'],
    'dosa': ['Snacks'], 'samosa': ['Snacks'], 'sandwich': ['Snacks'], 'burger': ['Snacks'], 'pizza': ['Snacks'], 'maggi': ['Snacks'], 'fries': ['Snacks'], 'pav bhaji': ['Snacks'], 'vada pav': ['Snacks'], 'misal pav': ['Snacks'], 'bhel puri': ['Snacks'], 'idli': ['Snacks'], 'uttapam': ['Snacks'], 'upma': ['Snacks'],
    'tea': ['Drinks'], 'coffee': ['Drinks'], 'lassi': ['Drinks'], 'chai': ['Drinks'], 'buttermilk': ['Drinks'],
    'gulab jamun': ['Sweets'], 'rasgulla': ['Sweets'], 'ice cream': ['Sweets'], 'cake': ['Sweets'], 'kulfi': ['Sweets'], 'jalebi': ['Sweets'],
  };

  items.forEach(item => {
    const nameLower = item.name.toLowerCase();
    let found = false;
    for (const keyword in keywords) {
      if (nameLower.includes(keyword)) {
        keywords[keyword].forEach(category => {
          categories[category].push(item);
        });
        found = true;
        break;
      }
    }
    if (!found) {
      categories['Other'].push(item);
    }
  });

  // Remove empty categories
  for (const category in categories) {
    if (categories[category].length === 0) {
      delete categories[category];
    }
  }

  return categories;
};

function formatCurrency(v?: string | number | null) {
  if (v === null || v === undefined || v === "") return "—";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(num)) return String(v);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num as number);
}

