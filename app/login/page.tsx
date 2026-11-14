"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Connexion en cours…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Connecté ! (redirection à venir)");
  }

  async function handleSignup() {
    setMessage("Inscription en cours…");
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Compte créé. Vérifiez votre e-mail.");
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-[#e1e9e8] rounded-2xl p-8">
      <h1 className="text-2xl font-bold mb-6">Connexion / Inscription</h1>
      <form onSubmit={handleLogin} className="space-y-4">
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
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-[#d3e0dd] rounded-lg p-3"
        />
        <button type="submit" className="w-full bg-[#176c64] text-white font-bold rounded-xl py-3">
          Se connecter
        </button>
      </form>
      <button onClick={handleSignup} className="w-full mt-3 bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3">
        Créer un compte
      </button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
      <p className="mt-6 text-xs text-[#698084] text-center">
        Auth Supabase. Configurez les variables d'environnement.
      </p>
    </div>
  );
}
