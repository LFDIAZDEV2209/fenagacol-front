"use client";
import * as React from "react";
import { Settings, Tags, Building2, MapPin, Type, Plus, Pencil, Trash2, Check, X, RotateCcw, Save } from "lucide-react";
import { Card, Input, Label, PageHeader, SortTh } from "@/components/ui";
import { useConfig, type FormTexts } from "@/lib/config-store";
import { DEPARTMENTS, deptName, getMunicipalitiesByDept, muniName } from "@/lib/mock-data";
import { useToast } from "@/components/toast";

type Tab = "roles" | "asocs" | "territorio" | "form";

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${on ? "bg-[#732427]" : "bg-[#D6D3D1]"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const selectCls =
  "h-9 w-full cursor-pointer rounded-lg border border-[#E7E2D9] bg-white px-2.5 text-[13px] text-[#1C1917] outline-none focus:border-[#732427]";

export default function ConfigPage() {
  const [tab, setTab] = React.useState<Tab>("roles");

  const tabs: { id: Tab; label: string; icon: typeof Tags }[] = [
    { id: "roles", label: "Roles", icon: Tags },
    { id: "asocs", label: "Asociaciones", icon: Building2 },
    { id: "territorio", label: "Territorio", icon: MapPin },
    { id: "form", label: "Formulario", icon: Type },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<Settings size={20} />}
        title="Configuración"
        subtitle="Gestiona las opciones del formulario sin tocar código."
      />

      <div className="animate-fade-up stagger-1 flex gap-1.5 overflow-x-auto rounded-xl border border-[#EDE9E1] bg-white p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${tab === t.id ? "bg-[#732427] text-white shadow-[0_4px_12px_rgba(115,36,39,0.3)]" : "text-[#78716C] hover:bg-[#F4F4F2] hover:text-[#1C1917]"}`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "roles" && <RolesTab />}
      {tab === "asocs" && <AsocsTab />}
      {tab === "territorio" && <TerritorioTab />}
      {tab === "form" && <FormTab />}
    </div>
  );
}

function RolesTab() {
  const { cfg, addRole, renameRole, toggleRole, deleteRole, allPeople } = useConfig();
  const { push } = useToast();
  const [draft, setDraft] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [editVal, setEditVal] = React.useState("");

  const usage = React.useCallback((label: string) => allPeople.filter((p) => p.roles.includes(label)).length, [allPeople]);
  const [sort, setSort] = React.useState<{ key: "name" | "usage"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const sorted = React.useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return cfg.roles.slice().sort((a, b) =>
      sort.key === "usage" ? (usage(a.label) - usage(b.label)) * dir : a.label.localeCompare(b.label, "es", { sensitivity: "base" }) * dir
    );
  }, [cfg.roles, sort, usage]);

  return (
    <Card className="animate-fade-up stagger-2 p-4">
      <h3 className="text-sm font-semibold text-[#1C1917]">Opciones de rol del formulario</h3>
      <p className="mt-0.5 text-[13px] text-[#78716C]">Lo que el campesino ve en el paso “Cuéntanos a qué te dedicas”.</p>

      <div className="mt-3 flex gap-2">
        <Input compact placeholder="Nuevo rol... (ej: Juez de gallera)" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { addRole(draft); setDraft(""); push(`Rol “${draft.trim()}” creado`); } }} />
        <button
          onClick={() => { if (!draft.trim()) return; addRole(draft); push(`Rol “${draft.trim()}” creado`); setDraft(""); }}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#732427] px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#481418] active:translate-y-0"
        >
          <Plus size={15} />
          Agregar
        </button>
      </div>

      <div className="mt-3 divide-y divide-[#F4F4F2] rounded-xl border border-[#EDE9E1]">
        <div className="flex items-center gap-1.5 bg-[#FAFAF8]/60 px-3.5 py-2">
          <span className="mr-auto text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">Ordenar:</span>
          {(["name", "usage"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }))}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${sort.key === k ? "bg-[#732427] text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}
            >
              {k === "name" ? "Nombre" : "Uso"} {sort.key === k && (sort.dir === "asc" ? "↑" : "↓")}
            </button>
          ))}
        </div>
        {sorted.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-3.5 py-2.5">
            {editing === r.id ? (
              <>
                <input
                  autoFocus
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { renameRole(r.id, editVal); push("Rol actualizado"); setEditing(null); }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  className="h-9 flex-1 rounded-lg border border-[#732427] px-2.5 text-[13px] outline-none"
                />
                <button onClick={() => { renameRole(r.id, editVal); push("Rol actualizado"); setEditing(null); }} aria-label="Guardar" className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[#732427] text-white">
                  <Check size={15} />
                </button>
                <button onClick={() => setEditing(null)} aria-label="Cancelar" className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#E7E2D9] text-[#78716C]">
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#1C1917]">
                    {r.label}
                    {r.isOther && <span className="ml-2 rounded-full bg-[#F8EDEF] px-2 py-0.5 text-[10px] font-bold text-[#732427]">PIDE DETALLE</span>}
                  </p>
                  <p className="text-[11px] text-[#A8A29E]">{usage(r.label)} registros lo usan</p>
                </div>
                {!r.active && <span className="rounded-full bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-semibold text-[#78716C]">Oculto</span>}
                <button onClick={() => { setEditing(r.id); setEditVal(r.label); }} aria-label={`Renombrar ${r.label}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#E7E2D9] text-[#78716C] transition-colors hover:border-[#732427]/40 hover:text-[#732427]">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={async () => {
                    if (!(await deleteRole(r.id))) push("Ese rol tiene registros, desactívalo en vez de eliminarlo", "error");
                    else push("Rol eliminado", "info");
                  }}
                  aria-label={`Eliminar ${r.label}`}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#E7E2D9] text-[#78716C] transition-colors hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
                <Toggle on={r.active} onClick={() => toggleRole(r.id)} label={`Mostrar ${r.label}`} />
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AsocsTab() {
  const { cfg, addAssoc, updateAssoc, toggleAssoc, deleteAssoc } = useConfig();
  const { push } = useToast();
  const [name, setName] = React.useState("");
  const [dept, setDept] = React.useState("");
  const [muni, setMuni] = React.useState("");
  const [editDept, setEditDept] = React.useState<Record<string, string>>({});
  const [aq, setAq] = React.useState("");
  const [asort, setAsort] = React.useState<{ key: "name" | "dept" | "muni" | "members"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const munisFor = (deptId: string) => (deptId ? getMunicipalitiesByDept(deptId) : []);

  const rows = React.useMemo(() => {
    const dir = asort.dir === "asc" ? 1 : -1;
    return cfg.assocs
      .filter((a) => !aq || a.name.toLowerCase().includes(aq.toLowerCase()))
      .slice()
      .sort((a, b) => {
        if (asort.key === "members") return ((a.members ?? 0) - (b.members ?? 0)) * dir;
        const av = asort.key === "dept" ? deptName(a.departmentId) : asort.key === "muni" ? muniName(a.municipalityId) : a.name;
        const bv = asort.key === "dept" ? deptName(b.departmentId) : asort.key === "muni" ? muniName(b.municipalityId) : b.name;
        return av.localeCompare(bv, "es", { sensitivity: "base" }) * dir;
      });
  }, [cfg.assocs, aq, asort]);

  function toggleAsort(key: typeof asort.key) {
    setAsort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <div className="space-y-3">
      <Card className="animate-fade-up stagger-2 p-4">
        <h3 className="text-sm font-semibold text-[#1C1917]">Nueva asociación</h3>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-[1fr_180px_180px_auto]">
          <Input compact placeholder="Nombre de la asociación" value={name} onChange={(e) => setName(e.target.value)} />
          <select value={dept} onChange={(e) => { setDept(e.target.value); setMuni(""); }} className={selectCls} aria-label="Departamento">
            <option value="">Departamento</option>
            {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={muni} onChange={(e) => setMuni(e.target.value)} disabled={!dept} className={selectCls} aria-label="Municipio">
            <option value="">Municipio</option>
            {munisFor(dept).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button
            onClick={() => {
              if (!name.trim() || !dept || !muni) { push("Completa nombre, departamento y municipio", "error"); return; }
              addAssoc({ name: name.trim(), departmentId: dept, municipalityId: muni });
              push(`Asociación “${name.trim()}” creada`);
              setName(""); setDept(""); setMuni("");
            }}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#732427] px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#481418]"
          >
            <Plus size={15} />
            Crear
          </button>
        </div>
      </Card>

      <Card className="animate-fade-up stagger-3 overflow-hidden">
        <div className="border-b border-[#F1EFEA] p-3">
          <Input compact placeholder="Buscar asociación por nombre..." value={aq} onChange={(e) => setAq(e.target.value)} />
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="bg-[#732427] text-left text-[11px] uppercase tracking-wider text-white/90">
                <SortTh label="Nombre" className="px-4 py-2.5" active={asort.key === "name"} dir={asort.dir} onToggle={() => toggleAsort("name")} />
                <SortTh label="Departamento" active={asort.key === "dept"} dir={asort.dir} onToggle={() => toggleAsort("dept")} />
                <SortTh label="Municipio" active={asort.key === "muni"} dir={asort.dir} onToggle={() => toggleAsort("muni")} />
                <SortTh label="Miembros" className="px-3 py-2.5 text-right" active={asort.key === "members"} dir={asort.dir} onToggle={() => toggleAsort("members")} />
                <th className="px-4 py-2.5 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F2]">
              {rows.map((a) => {
                const ed = editDept[a.id] ?? a.departmentId;
                return (
                  <tr key={a.id} className={`transition-colors hover:bg-[#FAF4F5] ${!a.active ? "opacity-55" : ""}`}>
                    <td className="px-4 py-2">
                      <input
                        defaultValue={a.name}
                        key={`${a.id}-${a.name}`}
                        onBlur={(e) => { if (e.target.value.trim() && e.target.value !== a.name) { updateAssoc(a.id, { name: e.target.value.trim() }); push("Nombre actualizado"); } }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        className="h-9 w-full rounded-lg border border-transparent bg-transparent px-2 text-[13px] font-medium text-[#1C1917] outline-none transition-colors hover:border-[#E7E2D9] focus:border-[#732427] focus:bg-white"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select value={ed} onChange={(e) => { setEditDept((s) => ({ ...s, [a.id]: e.target.value })); updateAssoc(a.id, { departmentId: e.target.value, municipalityId: "" }); }} className={selectCls} aria-label="Departamento">
                        {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select value={a.municipalityId} onChange={(e) => { updateAssoc(a.id, { municipalityId: e.target.value }); push("Municipio actualizado", "info"); }} className={selectCls} aria-label="Municipio">
                        <option value="">—</option>
                        {munisFor(ed).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{a.members ?? 0}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const err = await deleteAssoc(a.id);
                            if (err) push(err, "error");
                            else push("Asociación eliminada", "info");
                          }}
                          aria-label={`Eliminar ${a.name}`}
                          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#E7E2D9] text-[#78716C] transition-colors hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Toggle on={a.active} onClick={() => toggleAssoc(a.id)} label={`Mostrar ${a.name}`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TerritorioTab() {
  const { cfg, toggleDept, allPeople } = useConfig();
  const [q, setQ] = React.useState("");
  const list = DEPARTMENTS.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Card className="animate-fade-up stagger-2 p-4">
      <h3 className="text-sm font-semibold text-[#1C1917]">Departamentos visibles en el formulario</h3>
      <p className="mt-0.5 text-[13px] text-[#78716C]">Apaga los que no quieras ofrecer. Los municipios siguen la estructura DIVIPOLA.</p>
      <div className="mt-3">
        <Input compact placeholder="Buscar departamento..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => {
          const off = cfg.deptOff.includes(d.id);
          const regs = allPeople.filter((p) => p.departmentId === d.id).length;
          return (
            <div key={d.id} className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors ${off ? "border-[#EDE9E1] bg-[#FAFAF8] opacity-60" : "border-[#EDE9E1] bg-white"}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#1C1917]">{d.name}</p>
                <p className="text-[11px] text-[#A8A29E]">{getMunicipalitiesByDept(d.id).length} mpios · {regs} regs</p>
              </div>
              <Toggle on={!off} onClick={() => toggleDept(d.id)} label={`Mostrar ${d.name}`} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FormTab() {
  const { cfg, ready, setTexts, resetTexts } = useConfig();
  const { push } = useToast();
  const [draft, setDraft] = React.useState<FormTexts>(cfg.texts);
  const [synced, setSynced] = React.useState(false);

  // Sincroniza el borrador cuando llega la config guardada (patrón
  // "ajustar estado durante el render": sin effects, sin loops).
  if (ready && !synced) {
    setSynced(true);
    setDraft(cfg.texts);
  }

  const fields: { key: keyof FormTexts; label: string }[] = [
    { key: "moduleTitle", label: "Título del módulo" },
    { key: "moduleSub", label: "Subtítulo del módulo" },
    { key: "s1Title", label: "Paso 1 — título" },
    { key: "s1Sub", label: "Paso 1 — descripción" },
    { key: "s2Title", label: "Paso 2 — título" },
    { key: "s2Sub", label: "Paso 2 — descripción" },
    { key: "s3Title", label: "Paso 3 — título" },
    { key: "s3Sub", label: "Paso 3 — descripción" },
    { key: "s4Title", label: "Paso 4 — título" },
    { key: "s4Sub", label: "Paso 4 — descripción" },
    { key: "submitLabel", label: "Texto del botón enviar" },
  ];

  return (
    <Card className="animate-fade-up stagger-2 p-4">
      <h3 className="text-sm font-semibold text-[#1C1917]">Textos del formulario público</h3>
      <p className="mt-0.5 text-[13px] text-[#78716C]">Cambia títulos y descripciones sin tocar código.</p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <Input compact value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => { setTexts(draft); push("Textos del formulario guardados"); }}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#732427] px-5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#481418]"
        >
          <Save size={15} />
          Guardar cambios
        </button>
        <button
          onClick={() => { resetTexts(); push("Textos restablecidos", "info"); }}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#E7E2D9] bg-white px-4 text-[13px] font-semibold text-[#44403C] transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
        >
          <RotateCcw size={14} />
          Restablecer
        </button>
      </div>
      <div className="mt-4">
        <Label>Vista previa del módulo</Label>
        <div className="rounded-xl border border-[#EDE9E1] bg-[#FAFAF8] p-3.5">
          <p className="font-display text-[15px] font-bold text-[#1C1917]">{draft.moduleTitle}</p>
          <p className="text-[13px] text-[#78716C]">{draft.moduleSub}</p>
        </div>
      </div>
    </Card>
  );
}
