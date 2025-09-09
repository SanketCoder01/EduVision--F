"use client"

import dynamic from 'next/dynamic';

// Dynamically import the TechSynergy App component with no SSR
const TechSynergyApp = dynamic(
  () => import("../Responsive TechSynergy Website/src/App").then((mod) => mod.default),
  { ssr: false }
);

// Import TechSynergyLoginPortal for proper type checking
import '../components/TechSynergyLoginPortal';

export default function Page() {
  return <TechSynergyApp />;
}
