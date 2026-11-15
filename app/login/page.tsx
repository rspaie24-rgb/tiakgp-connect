"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage("Supabase non configuré. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Connecté !");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    if (!configured) {
      setMessage("Supabase non configuré.");
      return;
    }
    if (!email || !password) {
      setMessage("E-mail et mot de passe requis.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || email.split("@")[0] } },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Compte créé. Vérifie ton e-mail si la confirmation est activée, puis connecte-toi.");
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-[#e1e9e8] rounded-2xl p-8">
      <h1 className="text-2xl font-bold mb-6">Connexion / Inscription</h1>

      {!configured && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          Supabase n'est pas encore configuré sur ce déploiement. Ajoute les variables d'environnement sur Vercel (ou en local dans .env.local).
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Nom affiché (inscription)"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full border border-[#d3e0dd] rounded-lg p-3"
        />
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-[#d3e0dd] rounded-lg p-3"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe (min. 6 caractères)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-[#d3e0dd] rounded-lg p-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#176c64] text-white font-bold rounded-xl py-3 disabled:opacity-60"
        >
          {loading ? "…" : "Se connecter"}
        </button>
      </form>
      <button
        type="button"
        onClick={handleSignup}
        disabled={loading}
        className="w-full mt-3 bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3 disabled:opacity-60"
      >
        Créer un compte
      </button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
      <p className="mt-6 text-xs text-[#698084] text-center">
        Auth Supabase. Paiement toujours hors plateforme (direct client ↔ transporteur).
      </p>
    </div>
  );
}
