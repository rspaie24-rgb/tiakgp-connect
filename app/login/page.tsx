"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isValidPhone, normalizePhone, phoneToAuthEmail } from "@/lib/auth-phone";

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function goAfterAuth() {
    if (!configured) {
      router.push("/onboarding");
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/onboarding");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .limit(1);
    if (!roles?.length && !localStorage.getItem("yobbugo_role")) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage("Supabase non configuré.");
      return;
    }
    if (!isValidPhone(phone)) {
      setMessage("Numéro de téléphone invalide (ex. 77 123 45 67).");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const email = phoneToAuthEmail(phone);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(
          error.message.includes("Invalid login")
            ? "Numéro ou mot de passe incorrect."
            : error.message
        );
      } else {
        setMessage("Connecté !");
        await goAfterAuth();
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
    if (!fullName.trim()) {
      setMessage("Indique ton nom complet.");
      return;
    }
    if (!isValidPhone(phone)) {
      setMessage("Numéro de téléphone invalide (ex. 77 123 45 67).");
      return;
    }
    if (password.length < 6) {
      setMessage("Mot de passe : minimum 6 caractères.");
      return;
    }
    if (!accept) {
      setMessage("Tu dois accepter les CGU et la politique de confidentialité.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const email = phoneToAuthEmail(phone);
      const phoneNorm = normalizePhone(phone);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phoneNorm,
          },
        },
      });
      if (error) {
        setMessage(
          error.message.includes("already")
            ? "Ce numéro a déjà un compte. Connecte-toi."
            : error.message
        );
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ display_name: fullName.trim(), phone: phoneNorm })
            .eq("id", user.id);
        }
        setMessage("Compte créé ! Choisis ton profil…");
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-[#e1e9e8] rounded-2xl p-8">
      <h1 className="text-2xl font-bold mb-2">Connexion / Inscription</h1>
      <p className="text-sm text-[#698084] mb-6">
        Avec ton <strong>numéro de téléphone</strong> — pas besoin d&apos;e-mail.
      </p>

      {!configured && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          Supabase n&apos;est pas encore configuré sur ce déploiement.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1">Nom complet</label>
          <input
            type="text"
            placeholder="Prénom et nom"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Téléphone</label>
          <input
            type="tel"
            required
            placeholder="77 123 45 67 ou +221…"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="Minimum 6 caractères"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-[#425d61]">
          <input
            type="checkbox"
            checked={accept}
            onChange={e => setAccept(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            J’accepte les{" "}
            <Link href="/cgu" className="underline text-[#176c64]" target="_blank">
              CGU
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="underline text-[#176c64]" target="_blank">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

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
        disabled={loading || !accept}
        className="w-full mt-3 bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3 disabled:opacity-60"
      >
        Créer un compte
      </button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
      <p className="mt-6 text-xs text-[#698084] text-center">
        YobbuGo — paiement direct client ↔ transporteur.
      </p>
    </div>
  );
}
