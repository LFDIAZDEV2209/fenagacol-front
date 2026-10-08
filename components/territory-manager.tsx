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
import { useTerritoryQuery, type TerritoryRow } from "@/lib/server-data";
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

export function TerritoryManager() {
  const { DEPARTMENTS, refreshTerritory, territoryError } = useTerritory();
  const { cfg, toggleDept } = useConfig();
  const { push } = useToast();
  const [departmentId, setDepartmentId] = React.useState("");
  const [dq, setDq] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [dsort, setDsort] = React.useState<{
    key: "code" | "name";
    dir: "asc" | "desc";
  }>({ key: "name", dir: "asc" });
  const [sort, setSort] = React.useState<typeof dsort>({
    key: "name",
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
    sort: sort.key,
    dir: sort.dir,
    page,
    pageSize: PAGE_SIZE,
  });
  const fold = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const list = departments.rows.filter((d) =>
    fold(`${d.name} ${d.id}`).includes(fold(dq)),
  );
  const pages = Math.max(1, Math.ceil(municipalities.total / PAGE_SIZE));
  function chooseDepartment(id: string) {
    setDepartmentId(id);
    setQ("");
    setPage(1);
    if (window.matchMedia("(max-width: 767px)").matches) {
      window.requestAnimationFrame(() =>
        document
          .getElementById("territory-municipalities")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }
  function changeSort(key: "code" | "name", dept = false) {
    const setter = dept ? setDsort : setSort;
    setter((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
    if (!dept) setPage(1);
  }
  async function saved(kind: Kind, removed?: string) {
    departments.reload();
    municipalities.reload();
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
  const options = (
    departments.error || departments.loading ? DEPARTMENTS : departments.rows
  ).map((d) => ({ value: d.id, label: `${d.name} · ${d.id}` }));
  return (
    <div className="space-y-4">
      {territoryError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
        >
          <p>{territoryError}</p>
          <button
            className={actionClass}
            onClick={() => {
              void refreshTerritory().catch(() =>
                push("No se pudo actualizar el catálogo.", "error"),
              );
            }}
          >
            Actualizar catálogo
          </button>
        </div>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.5fr)]">
        <Card className="overflow-hidden">
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#1C1917]">
                Departamentos{" "}
                <span className="text-sm font-normal text-[#57534E]">
                  ({departments.total})
                </span>
              </h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditor({ kind: "departments" })}
              >
                <Plus size={15} /> Crear
              </Button>
            </div>
            <p className="text-[13px] text-[#57534E]">
              Abre un departamento para ver sus municipios y pueblos.
            </p>
            <Input
              compact
              aria-label="Buscar departamento por nombre o código"
              placeholder="Buscar nombre o código…"
              value={dq}
              onChange={(e) => setDq(e.target.value)}
            />
          </div>
          <ListState
            loading={departments.loading}
            error={departments.error}
            empty={!list.length}
            reload={departments.reload}
            create={() => setEditor({ kind: "departments" })}
          />
          {showDepartments && (
            <div className="max-h-[650px] overflow-auto">
              <table className="w-full text-[13px]">
                <caption className="sr-only">
                  Departamentos del catálogo administrado
                </caption>
                <thead className="sticky top-0 bg-[#732427] text-left text-white">
                  <tr>
                    <SortTh
                      label="Código"
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
                    <th scope="col" className="px-3 py-2.5">
                      <span className="sr-only">Acciones</span>
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
                      <td className="px-3 py-3 tabular-nums">{d.id}</td>
                      <td className="py-2">
                        <button
                          className="w-full rounded-lg py-1 text-left font-semibold text-[#732427] focus-visible:outline-2"
                          aria-pressed={departmentId === d.id}
                          onClick={() => chooseDepartment(d.id)}
                        >
                          {d.name}
                          <span className="mt-1 block text-xs font-normal text-[#57534E]">
                            {fmtNum(d.municipalityCount)} municipios y pueblos
                          </span>
                        </button>
                        <label className="mt-1 flex items-center gap-2 text-xs text-[#57534E]">
                          <input
                            type="checkbox"
                            className="accent-[#732427]"
                            checked={!cfg.deptOff.includes(d.id)}
                            onChange={() => toggleDept(d.id)}
                          />{" "}
                          Visible en el formulario
                        </label>
                      </td>
                      <td className="px-1">
                        <div className="flex flex-col">
                          <button
                            className={actionClass}
                            aria-label={`Editar ${d.name}`}
                            onClick={() =>
                              setEditor({ kind: "departments", row: d })
                            }
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className={actionClass}
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
            </div>
          )}
        </Card>
        <Card id="territory-municipalities" className="scroll-mt-20 overflow-hidden">
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#1C1917]">
                Municipios y pueblos
              </h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditor({ kind: "municipalities" })}
              >
                <Plus size={15} /> Crear municipio
              </Button>
            </div>
            <Combobox
              label="Departamento"
              options={[
                { value: "", label: "Todos los departamentos" },
                ...options,
              ]}
              value={departmentId}
              onChange={chooseDepartment}
            />
            <Input
              compact
              aria-label="Buscar municipio por nombre o código"
              placeholder="Buscar municipio o pueblo por nombre o código…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <ListState
            loading={municipalities.loading}
            error={municipalities.error}
            empty={!municipalities.rows.length}
            reload={municipalities.reload}
            create={() => setEditor({ kind: "municipalities" })}
          />
          {showMunicipalities && (
            <div className="max-h-[650px] overflow-auto">
              <table className="w-full text-[13px]">
                <caption className="sr-only">
                  Municipios y centros poblados
                </caption>
                <thead className="bg-[#732427] text-left text-white">
                  <tr>
                    <SortTh
                      label="Código"
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
                    <th scope="col" className="px-3 py-2.5">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {municipalities.rows.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAFAF8]">
                      <td className="px-3 py-3 tabular-nums">{m.id}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-[#1C1917]">{m.name}</p>
                        <p className="mt-0.5 text-xs text-[#57534E]">
                          {
                            options.find((d) => d.value === m.departmentId)
                              ?.label
                          }{" "}
                          · {m.id.length === 8 ? "Pueblo" : "Municipio"}
                        </p>
                      </td>
                      <td className="px-1 py-2">
                        <div className="flex flex-col sm:flex-row">
                          <button
                            className={actionClass}
                            aria-label={`Editar ${m.name}`}
                            onClick={() =>
                              setEditor({ kind: "municipalities", row: m })
                            }
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className={actionClass}
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
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1EFEA] p-3">
            <p
              role="status"
              aria-live="polite"
              className="text-xs tabular-nums text-[#57534E]"
            >
              {municipalities.loading
                ? "Buscando…"
                : `${municipalities.total ? (page - 1) * PAGE_SIZE + 1 : 0}–${Math.min(page * PAGE_SIZE, municipalities.total)} de ${fmtNum(municipalities.total)}`}
            </p>
            <div className="flex gap-1">
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
