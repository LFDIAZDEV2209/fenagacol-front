"use client";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { TerritoryManager } from "@/components/territory-manager";
export default function TerritoryPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<MapPin size={20} />}
        title="Territorio"
        subtitle="Busca, crea y edita departamentos, municipios y pueblos del catálogo."
      />
      <TerritoryManager />
    </div>
  );
}
