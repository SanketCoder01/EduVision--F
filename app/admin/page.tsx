"use client";

import { useRouter } from "next/navigation";
import { AdminPortal as TSAdminPortal } from "../../Responsive TechSynergy Website/src/components/pages/AdminPortal";
import type { PageType, ContentData } from "../../Responsive TechSynergy Website/src/types";

export default function AdminPage() {
  const router = useRouter();

  const setCurrentPage = (page: PageType) => {
    if (page === "home") router.push("/");
  };

  const handleContentUpdate = (_data: ContentData) => {
    // Optionally sync content to local state/store
  };

  return (
    <TSAdminPortal setCurrentPage={setCurrentPage} onContentUpdate={handleContentUpdate} />
  );
}


