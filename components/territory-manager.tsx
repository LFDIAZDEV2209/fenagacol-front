"use client";
import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button, Card, Combobox, Input, Label, SortTh } from "./ui";
import { useToast } from "./toast";
import { useConfig } from "@/lib/config-store";
import { useTerritory } from "@/lib/territory-store";
import {
  useTerritoryQuery,
  useTerritoryStats,
  type TerritoryRow,
} from "@/lib/server-data";
import { fmtNum } from "@/lib/format";

type Kind = "departments" | "municipalities";
type Editor = { kind: Kind; row?: TerritoryRow; remove?: boolean };
const PAGE_SIZE = 25;
const actionClass =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[#732427] hover:bg-[#F8EDEF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#732427] disabled:opacity-40";

function ListState({
  loading,
  error,
  empty,
  reload,
  create,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  reload: () => void;
  create: () => void;
}) {
  if (loading)
    return (
      <div role="status" className="space-y-2 p-5">
        <p className="text-sm text-[#57534E]">Cargando territorio…</p>
        {[0, 1, 2].map((n) => (
          <div key={n} className="h-10 animate-pulse rounded-lg bg-[#F1EFEA]" />
        ))}
      </div>
    );
  if (error)
    return (
      <div role="alert" className="space-y-3 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Button variant="secondary" onClick={reload}>
          Reintentar
        </Button>
      </div>
    );
  if (empty)
    return (
      <div className="space-y-3 p-8 text-center">
        <p className="text-sm text-[#57534E]">
          No hay resultados con estos filtros.
        </p>
        <Button variant="secondary" onClick={create}>
          <Plus size={16} /> Crear
        </Button>
      </div>
    );
  return null;
}

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const iconAction = "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#732427] hover:bg-[#F8EDEF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#732427] disabled:opacity-40";

function RegistrationBadge({ count }: { count: number | undefined }) {
  return count ? (
    <span
      className="inline-flex whitespace-nowrap rounded-full bg-[#F8EDEF] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#732427]"
      aria-label={`${fmtNum(count)} registrados`}
    >
      {fmtNum(count)}
    </span>
  ) : (
    <span
      className="text-xs text-[#57534E]"
      aria-label={
        count === undefined
          ? "Registrados pendientes de cargar"
          : "Sin registrados"
      }
    >
      —
    </span>
  );
}

export function TerritoryManager() {
  const territory = useTerritory();
  const {
    DEPARTMENTS,
    MUNICIPALITIES,
    refreshTerritory,
    territoryError,
    catalogReady,
  } = territory;
  const { cfg, toggleDept } = useConfig();
  const { push } = useToast();
  const stats = useTerritoryStats();
  const [departmentId, setDepartmentId] = React.useState("");
  const [type, setType] = React.useState<"todos" | "municipio" | "pueblo">(
    "todos",
  );
  const [dq, setDq] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [dsort, setDsort] = React.useState<{
    key: "code" | "name";
    dir: "asc" | "desc";
  }>({ key: "code", dir: "asc" });
  const [sort, setSort] = React.useState<typeof dsort>({
    key: "code",
    dir: "asc",
  });
  const [editor, setEditor] = React.useState<Editor | null>(null);
  const departments = useTerritoryQuery("departments", {
    q: "",
    departmentId: "",
    sort: dsort.key,
    dir: dsort.dir,
    page: 1,
    pageSize: 100,
  });
  const municipalities = useTerritoryQuery("municipalities", {
    q,
    departmentId,
    type,
    sort: sort.key,
    dir: sort.dir,
    page,
    pageSize: PAGE_SIZE,
  });
  const term = fold(dq);
  const list = React.useMemo(
    () =>
      departments.rows.filter((d) => fold(`${d.name} ${d.id}`).includes(term)),
    [departments.rows, term],
  );
  const byDept = React.useMemo(
    () => new Map(stats.data?.by_dept.map((d) => [d.id, d.value]) ?? []),
    [stats.data],
  );
  const byMuni = React.useMemo(
    () => new Map(stats.data?.by_muni.map((m) => [m.id, m.value]) ?? []),
    [stats.data],
  );
  const departmentNames = React.useMemo(
    () => new Map(DEPARTMENTS.map((d) => [d.id, d.name])),
    [DEPARTMENTS],
  );
  const options = React.useMemo(
    () =>
      DEPARTMENTS.map((d) => ({ value: d.id, label: `${d.name} · ${d.id}` })),
    [DEPARTMENTS],
  );
  const hidden = React.useMemo(() => new Set(cfg.deptOff), [cfg.deptOff]);
  const counts = React.useMemo(() => {
    const municipios = MUNICIPALITIES.reduce(
      (n, m) => n + Number(m.id.length === 5),
      0,
    );
    return { municipios, pueblos: MUNICIPALITIES.length - municipios };
  }, [MUNICIPALITIES]);
  const registered = React.useMemo(
    () => stats.data?.by_dept.reduce((n, d) => n + d.value, 0),
    [stats.data],
  );
  const pages = Math.max(1, Math.ceil(municipalities.total / PAGE_SIZE));
  function chooseDepartment(id: string) {
    setDepartmentId(id);
    setQ("");
    setPage(1);
    if (window.matchMedia("(max-width: 767px)").matches)
      window.requestAnimationFrame(() =>
        document
          .getElementById("territory-municipalities")
          ?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
            block: "start",
          }),
      );
  }
  function changeSort(key: "code" | "name", dept = false) {
    (dept ? setDsort : setSort)((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
    if (!dept) setPage(1);
  }
  async function saved(kind: Kind, removed?: string) {
    departments.reload();
    municipalities.reload();
    stats.reload();
    if (kind === "municipalities") setPage(1);
    if (removed === departmentId) chooseDepartment("");
    push(
      removed ? "Territorio eliminado." : "Cambios guardados en el territorio.",
    );
    try {
      await refreshTerritory();
    } catch {
      push(
        "El cambio quedó guardado. Reintenta actualizar el catálogo para verlo en los filtros.",
        "info",
      );
    }
  }
  const showDepartments =
    !departments.loading && !departments.error && list.length > 0;
  const showMunicipalities =
    !municipalities.loading &&
    !municipalities.error &&
    municipalities.rows.length > 0;
  return (
    <div className="space-y-4">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[#E7E2D9] bg-[#FAFAF8] px-4 py-3 text-[13px] text-[#57534E]"
      >
        <span>
          <strong className="tabular-nums text-[#1C1917]">
            {fmtNum(DEPARTMENTS.length)}
          </strong>{" "}
          departamentos
        </span>
        <span>
          <strong className="tabular-nums text-[#1C1917]">
            {fmtNum(MUNICIPALITIES.length)}
          </strong>{" "}
          municipios y pueblos{" "}
          <span className="block text-xs sm:inline">
            ({fmtNum(counts.municipios)} municipios · {fmtNum(counts.pueblos)}{" "}
            pueblos){!catalogReady ? " · catálogo en actualización" : ""}
          </span>
        </span>
        <span className="sm:ml-auto">
          <strong className="tabular-nums text-[#732427]">
            {registered === undefined ? "—" : fmtNum(registered)}
          </strong>{" "}
          registrados{stats.loading ? " · actualizando" : ""}
        </span>
      </div>
      {(territoryError || stats.error) && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
        >
          <p>{territoryError || stats.error}</p>
          <button
            className={actionClass}
            onClick={() => {
              stats.reload();
              void refreshTerritory().catch(() =>
                push("No se pudo actualizar el catálogo.", "error"),
              );
            }}
          >
            Reintentar actualización
          </button>
        </div>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(460px,0.85fr)_minmax(0,1.4fr)]">
        <Card className="rounded-2xl">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#1C1917]">
                Departamentos{" "}
                <span className="text-sm font-normal text-[#57534E]">
                  ({departments.total})
                </span>
              </h2>
              <Button
                size="sm"
                variant="secondary"
                className="min-h-10"
                onClick={() => setEditor({ kind: "departments" })}
              >
                <Plus size={15} /> Crear
              </Button>
            </div>
            <p className="text-xs text-[#57534E]">
              Abre un departamento para ver su territorio. Oculta del formulario
              público los que no ofrezcas.
            </p>
            <div>
              <Label htmlFor="territory-department-search">
                Buscar departamento
              </Label>
              <Input
                compact
                id="territory-department-search"
                placeholder="Nombre o código"
                value={dq}
                onChange={(e) => setDq(e.target.value)}
                className="placeholder:text-[#57534E]"
              />
            </div>
          </div>
          <ListState
            loading={departments.loading}
            error={departments.error}
            empty={!list.length}
            reload={departments.reload}
            create={() => setEditor({ kind: "departments" })}
          />
          {showDepartments && (
            <table className="w-full table-fixed text-[13px]">
              <caption className="sr-only">
                Departamentos: municipios, registrados y gestión
              </caption>
              <thead className="bg-[#732427] text-left text-white">
                <tr>
                  <SortTh
                    label="Código"
                    className="w-20 px-3 py-2.5"
                    active={dsort.key === "code"}
                    dir={dsort.dir}
                    onToggle={() => changeSort("code", true)}
                  />
                  <SortTh
                    label="Nombre"
                    active={dsort.key === "name"}
                    dir={dsort.dir}
                    onToggle={() => changeSort("name", true)}
                  />
                  <th scope="col" className="w-[124px] px-2 py-2.5">
                    <span className="sr-only">
                      Visibilidad, editar y eliminar
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {list.map((d) => (
                  <tr
                    key={d.id}
                    className={
                      departmentId === d.id
                        ? "bg-[#F8EDEF]"
                        : "hover:bg-[#FAFAF8]"
                    }
                  >
                    <td className="px-3 py-2">
                      <span className="rounded-md bg-[#F1EFEA] px-2 py-1 text-xs font-semibold tabular-nums text-[#57534E]">
                        {d.id}
                      </span>
                    </td>
                    <td className="py-1.5">
                      <button
                        className="block min-h-10 w-full min-w-0 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#732427]"
                        title={d.name}
                        aria-pressed={departmentId === d.id}
                        onClick={() => chooseDepartment(d.id)}
                      >
                        <span className="block truncate font-semibold text-[#1C1917]">
                          {d.name}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-[#57534E]">
                          {fmtNum(d.municipalityCount)} municipios y pueblos ·{" "}
                          <RegistrationBadge
                            count={
                              stats.data ? (byDept.get(d.id) ?? 0) : undefined
                            }
                          />
                          <span>registrados</span>
                        </span>
                      </button>
                    </td>
                    <td className="py-1.5 pr-2">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!hidden.has(d.id)}
                          aria-label={`Mostrar ${d.name} en el formulario público`}
                          title={`Mostrar ${d.name} en el formulario público`}
                          className={`${iconAction} focus-visible:ring-offset-2`}
                          onClick={() => toggleDept(d.id)}
                        >
                          <span
                            aria-hidden="true"
                            className={`relative block h-5 w-8 rounded-full ${hidden.has(d.id) ? "bg-[#57534E]" : "bg-[#732427]"}`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${hidden.has(d.id) ? "left-0.5" : "left-3.5"}`}
                            />
                          </span>
                        </button>
                        <button
                          className={iconAction}
                          aria-label={`Editar ${d.name}`}
                          onClick={() =>
                            setEditor({ kind: "departments", row: d })
                          }
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className={iconAction}
                          aria-label={`Eliminar ${d.name}`}
                          onClick={() =>
                            setEditor({
                              kind: "departments",
                              row: d,
                              remove: true,
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card
          id="territory-municipalities"
          className="min-w-0 scroll-mt-20 rounded-2xl"
        >
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#1C1917]">
                Municipios y pueblos
              </h2>
              <Button
                size="sm"
                variant="secondary"
                className="min-h-10"
                onClick={() => setEditor({ kind: "municipalities" })}
              >
                <Plus size={15} /> Crear municipio
              </Button>
            </div>
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(110px,0.7fr)_minmax(0,1fr)]">
              <Combobox
                label="Departamento"
                options={[
                  { value: "", label: "Todos los departamentos" },
                  ...options,
                ]}
                value={departmentId}
                onChange={chooseDepartment}
              />
              <div>
                <Label htmlFor="territory-type">Tipo</Label>
                <select
                  id="territory-type"
                  className="h-12 w-full rounded-xl border border-[#E7E2D9] bg-white px-3 text-sm text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#732427]"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as typeof type);
                    setPage(1);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="municipio">Municipios</option>
                  <option value="pueblo">Pueblos</option>
                </select>
              </div>
              <div>
                <Label htmlFor="territory-municipality-search">
                  Buscar territorio
                </Label>
                <Input
                  id="territory-municipality-search"
                  placeholder="Nombre o código"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  className="placeholder:text-[#57534E]"
                />
              </div>
            </div>
          </div>
          <ListState
            loading={municipalities.loading}
            error={municipalities.error}
            empty={!municipalities.rows.length}
            reload={municipalities.reload}
            create={() => setEditor({ kind: "municipalities" })}
          />
          {showMunicipalities && (
            <table className="w-full table-fixed text-[13px]">
              <caption className="sr-only">
                Municipios y pueblos con registrados y acciones de gestión
              </caption>
              <thead className="bg-[#732427] text-left text-white">
                <tr>
                  <SortTh
                    label="Código"
                    className="w-[92px] px-3 py-2.5"
                    active={sort.key === "code"}
                    dir={sort.dir}
                    onToggle={() => changeSort("code")}
                  />
                  <SortTh
                    label="Nombre"
                    active={sort.key === "name"}
                    dir={sort.dir}
                    onToggle={() => changeSort("name")}
                  />
                  <th
                    scope="col"
                    className="w-14 px-1 py-2.5 text-center sm:w-20"
                  >
                    <abbr title="Registrados" className="no-underline">
                      Regs.
                    </abbr>
                  </th>
                  <th scope="col" className="w-[84px] px-1 py-2.5 text-center">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {municipalities.rows.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-3 py-2 tabular-nums text-[#57534E]">
                      {m.id}
                    </td>
                    <td className="px-2 py-2">
                      <p className="break-words font-semibold text-[#1C1917]">
                        {m.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#57534E]">
                        {departmentNames.get(m.departmentId ?? "") ??
                          m.departmentId}{" "}
                        · {m.id.length === 8 ? "Pueblo" : "Municipio"}
                      </p>
                    </td>
                    <td className="px-1 py-2 text-center">
                      <RegistrationBadge
                        count={stats.data ? (byMuni.get(m.id) ?? 0) : undefined}
                      />
                    </td>
                    <td className="px-1 py-2">
                      <div className="flex justify-end">
                        <button
                          className={iconAction}
                          aria-label={`Editar ${m.name}`}
                          onClick={() =>
                            setEditor({ kind: "municipalities", row: m })
                          }
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className={iconAction}
                          aria-label={`Eliminar ${m.name}`}
                          onClick={() =>
                            setEditor({
                              kind: "municipalities",
                              row: m,
                              remove: true,
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1EFEA] p-3">
            <p
              role="status"
              aria-live="polite"
              className="text-xs tabular-nums text-[#57534E]"
            >
              {municipalities.loading
                ? "Buscando…"
                : `${municipalities.total ? (page - 1) * PAGE_SIZE + 1 : 0}–${Math.min(page * PAGE_SIZE, municipalities.total)} de ${fmtNum(municipalities.total)}`}
            </p>
            <div className="flex">
              <button
                className={actionClass}
                disabled={
                  page <= 1 || municipalities.loading || !!municipalities.error
                }
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={15} /> Anterior
              </button>
              <button
                className={actionClass}
                disabled={
                  page >= pages ||
                  municipalities.loading ||
                  !!municipalities.error
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </Card>
      </div>
      {editor && (
        <TerritoryEditor
          key={`${editor.kind}-${editor.row?.id ?? "new"}-${editor.remove}`}
          editor={editor}
          departmentId={departmentId}
          departments={options}
          onClose={() => setEditor(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}

function TerritoryEditor({
  editor,
  departmentId,
  departments,
  onClose,
  onSaved,
}: {
  editor: Editor;
  departmentId: string;
  departments: { value: string; label: string }[];
  onClose: () => void;
  onSaved: (kind: Kind, removed?: string) => Promise<void>;
}) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const { push } = useToast();
  const [code, setCode] = React.useState(editor.row?.id ?? "");
  const [name, setName] = React.useState(editor.row?.name ?? "");
  const [dept, setDept] = React.useState(
    editor.row?.departmentId ?? departmentId,
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const municipality = editor.kind === "municipalities";
  const title = `${editor.remove ? "Eliminar" : editor.row ? "Editar" : "Crear"} ${municipality ? "municipio o pueblo" : "departamento"}`;
  React.useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.showModal();
    node
      ?.querySelector<HTMLElement>(editor.remove ? "button" : "input")
      ?.focus();
    return () => {
      node?.close();
      previous?.focus();
    };
  }, [editor.remove]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const next: Record<string, string> = {};
    if (!editor.remove) {
      const pattern = municipality
        ? editor.row?.id.length === 8
          ? /^\d{8}$/
          : /^\d{5}$/
        : /^\d{2}$/;
      if (!pattern.test(code))
        next.code = municipality
          ? "Escribe un código de cinco dígitos."
          : "Escribe un código de dos dígitos.";
      if (name.trim().length < 2 || name.trim().length > 100)
        next.name = "Escribe un nombre entre 2 y 100 caracteres.";
      if (municipality && (!dept || !code.startsWith(dept)))
        next.department =
          "Selecciona el departamento que coincide con los primeros dos dígitos.";
    }
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) {
      window.setTimeout(
        () =>
          dialog.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus(),
        0,
      );
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(
        `/api/admin/${editor.kind}${editor.row ? `/${encodeURIComponent(editor.row.id)}` : ""}`,
        {
          method: editor.remove ? "DELETE" : editor.row ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: editor.remove
            ? undefined
            : JSON.stringify({ code, name, departmentId: dept }),
        },
      );
      const body = (await r.json()) as { error?: string };
      if (!r.ok)
        throw new Error(body.error ?? "No se pudo guardar. Vuelve a intentar.");
      await onSaved(editor.kind, editor.remove ? editor.row?.id : undefined);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar. Comprueba la conexión.";
      setServerError(message);
      push(message, "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="territory-title"
      aria-describedby="territory-help"
      onCancel={(e) => {
        e.preventDefault();
        if (!saving) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(94vw,480px)] overflow-auto rounded-2xl bg-white p-0 text-[#1C1917] shadow-xl backdrop:bg-black/45"
    >
      <form onSubmit={submit} noValidate className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="territory-title" className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            className={actionClass}
            aria-label="Cerrar formulario"
            disabled={saving}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <p id="territory-help" className="text-sm text-[#57534E]">
          {editor.remove
            ? `¿Eliminar ${editor.row?.name}? Solo se puede eliminar si no tiene registros vinculados.`
            : editor.row
              ? "El código se conserva para proteger los registros vinculados."
              : "Usa un código DIVIPOLA disponible y un nombre fácil de reconocer."}
        </p>
        {!editor.remove && (
          <fieldset disabled={saving} className="space-y-4">
            <div>
              <Label htmlFor="territory-code">Código</Label>
              <Input
                id="territory-code"
                inputMode="numeric"
                autoComplete="off"
                value={code}
                readOnly={!!editor.row}
                maxLength={
                  municipality ? (editor.row?.id.length === 8 ? 8 : 5) : 2
                }
                onChange={(e) => setCode(e.target.value)}
                aria-invalid={!!errors.code}
                aria-describedby={errors.code ? "code-error" : undefined}
              />
              <p id="code-error" className="mt-1 text-sm text-red-700">
                {errors.code}
              </p>
            </div>
            <div>
              <Label htmlFor="territory-name">Nombre</Label>
              <Input
                id="territory-name"
                autoComplete="off"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              <p id="name-error" className="mt-1 text-sm text-red-700">
                {errors.name}
              </p>
            </div>
            {municipality && (
              <div>
                <Label htmlFor="territory-dept">Departamento</Label>
                <select
                  id="territory-dept"
                  className="h-12 w-full rounded-xl border border-[#E7E2D9] bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-[#732427]"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  aria-invalid={!!errors.department}
                  aria-describedby={
                    errors.department ? "department-error" : undefined
                  }
                >
                  <option value="">Selecciona un departamento</option>
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <p id="department-error" className="mt-1 text-sm text-red-700">
                  {errors.department}
                </p>
              </div>
            )}
          </fieldset>
        )}
        {serverError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Guardando…" : editor.remove ? "Eliminar" : "Guardar"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
