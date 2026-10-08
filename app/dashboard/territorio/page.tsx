"use client";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { TerritoryManager } from "@/components/territory-manager";
import { TerritoryExport } from "@/components/territory-export";
export default function TerritoryPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<MapPin size={20} />}
        title="Territorio"
        subtitle="Busca, crea y edita departamentos, municipios y pueblos del catálogo."
        actions={<TerritoryExport />}
        actionsClassName="w-full sm:w-auto"
      />
      <TerritoryManager />
    </div>
  );
}
