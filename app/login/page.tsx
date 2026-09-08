"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  Users,
  QrCode,
} from "lucide-react";
import { Button, Card, Input, Label } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-[#78716C]">Cargando...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && user) router.replace(params.get("next") ?? "/dashboard");
  }, [authLoading, user, router, params]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace(params.get("next") ?? "/dashboard");
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        {/* Columna formulario */}
        <div className="flex flex-col px-5 py-5 sm:px-8">
          <div className="flex items-center">
            <Link href="/" className="flex cursor-pointer items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#BE123C] text-xs font-black text-white shadow-[0_4px_14px_rgba(190,18,60,0.35)]">TG</span>
              <span className="leading-tight">
                <span className="block font-display text-[15px] font-bold text-[#1C1917]">Tu Carné Gremial</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#BE123C]">Fenagacol</span>
              </span>
            </Link>
            <Link href="/registro" className="ml-auto cursor-pointer rounded-full border border-[#EDE9E1] px-3.5 py-1.5 text-[13px] font-semibold text-[#57534E] transition-all duration-200 hover:-translate-y-px hover:border-[#BE123C]/40 hover:text-[#BE123C]">
              Ir al registro
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <Card className="animate-fade-up w-full max-w-[410px] border-[#EDE9E1] p-6 shadow-[0_16px_48px_rgba(28,25,23,0.08)] sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#BE123C] text-white shadow-[0_6px_18px_rgba(190,18,60,0.4)]">
                  <Lock size={19} />
                </span>
                <div>
                  <h1 className="font-display text-[22px] font-bold leading-tight text-[#1C1917]">Ingresar al panel</h1>
                  <p className="text-[13px] text-[#78716C]">Solo personal autorizado del gremio.</p>
                </div>
              </div>

              <form onSubmit={submit} className="mt-6 space-y-3.5">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@fenagacol.co"
                      type="email"
                      autoComplete="username"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      className="h-11 pl-10 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#A8A29E] transition-colors hover:bg-[#F4F4F2] hover:text-[#1C1917]"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="animate-pop-in flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    {error}
                  </p>
                )}
                <Button type="submit" className="h-11 w-full text-[15px]" disabled={loading || authLoading}>
                  <LogIn size={16} />
                  {loading ? "Verificando..." : "Entrar al dashboard"}
                </Button>
              </form>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#F1EFEA] pt-4">
                {[
                  { icon: ShieldCheck, label: "Sesión segura" },
                  { icon: Zap, label: "Acceso inmediato" },
                  { icon: FileSpreadsheet, label: "Exporta a Excel" },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-[#FAFAF8] px-1 py-2.5 text-center">
                      <Icon size={16} className="text-[#BE123C]" />
                      <span className="text-[11px] font-semibold leading-tight text-[#57534E]">{f.label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-center text-xs leading-relaxed text-[#A8A29E]">
                ¿Sin acceso? Contacta al administrador del sistema.
              </p>
            </Card>
          </div>

          <p className="text-center text-[11px] text-[#A8A29E]">© {new Date().getFullYear()} Fenagacol · Tu Carné Gremial</p>
        </div>

        {/* Columna visual con wave divisorio */}
        <div className="relative hidden min-h-screen overflow-hidden bg-[#3D0A17] lg:block">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1000&q=80&auto=format&fit=crop"
            alt="Campo colombiano al atardecer"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A0710]/95 via-[#BE123C]/35 to-[#BE123C]/10" />
          {/* Wave de separación */}
          <svg className="absolute inset-y-0 -left-px z-10 h-full w-14" viewBox="0 0 56 800" preserveAspectRatio="none" aria-hidden="true">
            <path d="M56 0 C 18 220, 18 580, 56 800 L 56 0 Z" fill="#ffffff" />
          </svg>

          <div className="absolute left-1/2 top-10 z-10 flex max-w-[92%] -translate-x-1/2 flex-wrap justify-center gap-2.5">
            <span className="animate-fade-up stagger-1 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md">
              <Users size={14} />
              +12 mil registrados
            </span>
            <span className="animate-fade-up stagger-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md">
              <QrCode size={14} />
              Comparte por QR
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Panel administrativo</p>
            <h2 className="font-display mt-2 text-[30px] font-bold leading-[1.05] text-white">Datos claros para<br />decisiones del gremio.</h2>
            <p className="mt-2.5 max-w-[40ch] text-[13px] leading-relaxed text-white/70">
              Filtra por departamento, municipio, rol y asociación. Exporta a Excel y comparte el formulario por WhatsApp o QR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
