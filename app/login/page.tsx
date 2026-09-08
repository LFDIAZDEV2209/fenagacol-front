"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Eye, EyeOff, Lock, LogIn } from "lucide-react";
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
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-[#EDE9E1] bg-white px-5">
          <Link href="/" className="flex cursor-pointer items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#BE123C] text-[11px] font-black text-white">TG</div>
            <span className="font-display text-[15px] font-bold text-[#1C1917]">Tu Carné Gremial</span>
          </Link>
          <Link href="/registro" className="ml-auto cursor-pointer text-[13px] font-semibold text-[#BE123C] hover:underline">
            Ir al registro
          </Link>
        </div>

        <div className="grid flex-1 lg:grid-cols-2">
          <div className="flex items-center justify-center p-5 sm:p-8">
            <Card className="animate-fade-up w-full max-w-[400px] p-6 sm:p-7">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-[#F3D9E0] bg-[#FFF1F2] text-[#BE123C]">
                <Lock size={20} />
              </div>
              <h1 className="font-display text-[22px] font-bold text-[#1C1917]">Ingresar al panel</h1>
              <p className="mt-1 text-[13px] text-[#78716C]">Solo personal autorizado del gremio.</p>

              <form onSubmit={submit} className="mt-6 space-y-3.5">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@fenagacol.co"
                    type="email"
                    autoComplete="username"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      className="h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#A8A29E] transition-colors hover:bg-[#F1EFEA] hover:text-[#1C1917]"
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

              <p className="mt-5 border-t border-[#F1EFEA] pt-4 text-center text-xs leading-relaxed text-[#A8A29E]">
                Sesión protegida con cookie segura.
                <br />
                ¿Sin acceso? Contacta al administrador del sistema.
              </p>
            </Card>
          </div>

          <div className="relative hidden overflow-hidden bg-[#1C0A0E] lg:block">
            <Image src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80&auto=format&fit=crop" alt="Campo colombiano" fill className="object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C0A0E] via-[#BE123C]/25 to-transparent" />
            <div className="absolute bottom-0 p-9 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">Panel administrativo</p>
              <h2 className="font-display mt-2 text-[26px] font-bold leading-tight">Datos claros para<br />decisiones del gremio.</h2>
              <p className="mt-2.5 max-w-[38ch] text-[13px] text-white/70">Filtra por departamento, municipio, rol y asociación. Exporta a Excel y comparte el formulario.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
