"use client";
import * as React from "react";
import Link from "next/link";
import { Button, Card, Input, Label } from "@/components/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@fenagacol.co");
  const [password, setPassword] = React.useState("admin123");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Completa correo y contraseña"); return; }
    setLoading(true);
    await new Promise(r=> setTimeout(r, 700));
    // mock: cualquier combo con @ pasa, para demo acepta admin
    if (email.includes("@") && password.length >= 4) {
      localStorage.setItem("fenagacol_admin", JSON.stringify({ email, name: "Administrador" }));
      router.push("/dashboard");
    } else {
      setError("Credenciales no válidas — usa admin@fenagacol.co / admin123");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f8f3e8] flex">
      <div className="flex-1 flex flex-col">
        <div className="h-[64px] flex items-center px-6 border-b border-[#ece2d1] bg-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6b1220] grid place-items-center text-white font-black text-xs">TG</div>
            <span className="font-display font-bold text-[#1c1a17]">Tu Carné Gremial</span>
          </Link>
          <Link href="/registro" className="ml-auto text-sm font-medium text-[#6b1220] hover:underline">Ir al registro</Link>
        </div>

        <div className="flex-1 grid lg:grid-cols-2">
          <div className="flex items-center justify-center p-6 sm:p-10">
            <Card className="w-full max-w-[420px] p-7 sm:p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#fdf8ef] border border-[#ece2d1] grid place-items-center text-[#6b1220] mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-[#1c1a17]">Ingresar al panel</h1>
              <p className="text-sm text-[#7a6e5a] mt-1.5">Solo personal autorizado. Usa tus credenciales de administrador.</p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <div>
                  <Label>Correo electrónico</Label>
                  <Input value={email} onChange={e=> setEmail(e.target.value)} placeholder="admin@fenagacol.co" type="email" />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <Input value={password} onChange={e=> setPassword(e.target.value)} placeholder="••••••••" type="password" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Ingresando..." : "Entrar al dashboard"}</Button>
                <p className="text-xs text-center text-[#9a8d78]">Demo: <span className="font-mono bg-[#fdf8ef] px-1.5 py-0.5 rounded border">admin@fenagacol.co / admin123</span></p>
              </form>

              <div className="mt-6 pt-6 border-t border-[#f0e8d5] flex items-center justify-between text-xs text-[#9a8d78]">
                <span>¿Olvidaste tu contraseña?</span>
                <a className="font-semibold text-[#6b1220] hover:underline" href="#">Recuperar</a>
              </div>
            </Card>
          </div>

          <div className="hidden lg:block relative bg-[#1c0a0d] overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80&auto=format&fit=crop" alt="Campo" fill className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c0a0d] via-[#6b1220]/30 to-transparent" />
            <div className="absolute bottom-0 p-10 text-white">
              <p className="text-xs font-semibold tracking-widest uppercase opacity-60">Panel administrativo</p>
              <h2 className="font-display text-[28px] font-bold leading-tight mt-2">Datos claros para<br/>decisiones del gremio.</h2>
              <p className="text-sm text-white/70 mt-3 max-w-[36ch]">Consulta registros por departamento, municipio, rol y asociación. Exporta y genera reportes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
