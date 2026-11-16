import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import "./styles.css";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

type Offer = { id: number; title: string; details: string; price: string; kind: "GP" | "Tiak-Tiak" };
type Screen = "home" | "login" | "publish" | "account";

function phoneToEmail(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^221/, "");
  return `phone-${digits}@yobbugo.invalid`;
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [notice, setNotice] = useState("");
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const syncNetwork = () => setOffline(!navigator.onLine);
    window.addEventListener("online", syncNetwork);
    window.addEventListener("offline", syncNetwork);
    return () => {
      window.removeEventListener("online", syncNetwork);
      window.removeEventListener("offline", syncNetwork);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadOffers() {
    if (!supabase) return;
    const [{ data: gp }, { data: local }] = await Promise.all([
      supabase.from("gp_trips").select("id, origin_city, destination_city, departure_at, capacity_kg, price_label").eq("status", "active").order("created_at", { ascending: false }).limit(20),
      supabase.from("local_availabilities").select("id, location, district, price_label").eq("status", "active").order("created_at", { ascending: false }).limit(20),
    ]);
    setOffers([
      ...(gp ?? []).map(row => ({ id: Number(row.id), kind: "GP" as const, title: `${row.origin_city ?? "Départ"} → ${row.destination_city ?? "Destination"}`, details: [row.departure_at, row.capacity_kg ? `${row.capacity_kg} kg` : null].filter(Boolean).join(" · "), price: row.price_label ?? "À convenir" })),
      ...(local ?? []).map(row => ({ id: Number(row.id), kind: "Tiak-Tiak" as const, title: row.location ?? "Zone à préciser", details: row.district ?? "Livraison locale", price: row.price_label ?? "À convenir" })),
    ]);
  }

  useEffect(() => { void loadOffers(); }, []);

  async function shareApp() {
    await Share.share({ title: "YobbuGo", text: "Trouve un transporteur ou publie ta disponibilité sur YobbuGo.", url: "https://www.yobbugo.com" });
  }

  async function openWebsite() {
    await Browser.open({ url: "https://www.yobbugo.com" });
  }

  const native = Capacitor.isNativePlatform();
  const content = useMemo(() => {
    if (!supabase) return <SetupWarning />;
    if (screen === "login") return <Login onDone={() => setScreen("home")} onNotice={setNotice} />;
    if (screen === "publish") return <Publish user={user} onNotice={setNotice} onDone={() => { setScreen("home"); void loadOffers(); }} />;
    if (screen === "account") return <Account user={user} onNotice={setNotice} />;
    return <Home offers={offers} onRefresh={() => void loadOffers()} onPublish={() => setScreen("publish")} />;
  }, [offers, screen, user]);

  return <main>
    <header><button className="brand" onClick={() => setScreen("home")}>Yobbu<span>Go</span></button><div className="actions"><button onClick={() => void shareApp()}>Partager</button><button onClick={() => void openWebsite()}>Site web</button></div></header>
    {offline && <p className="banner">Hors connexion : les nouvelles données seront disponibles au retour du réseau.</p>}
    {notice && <p className="notice">{notice}</p>}
    {content}
    <nav><button onClick={() => setScreen("home")}>Offres</button><button onClick={() => setScreen(user ? "publish" : "login")}>Publier</button><button onClick={() => setScreen(user ? "account" : "login")}>{user ? "Compte" : "Connexion"}</button></nav>
    {native && <p className="native-note">Application native YobbuGo</p>}
  </main>;
}

function SetupWarning() { return <section><h1>Configuration requise</h1><p>Ajoutez les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY avant de compiler l’application mobile.</p></section>; }

function Home({ offers, onRefresh, onPublish }: { offers: Offer[]; onRefresh: () => void; onPublish: () => void }) {
  return <section><div className="hero"><p className="eyebrow">Transport de colis</p><h1>YobbuGo, partout avec vous.</h1><p>Trouvez un GP ou un Tiak-Tiak et publiez vos disponibilités.</p><button className="primary" onClick={onPublish}>Publier une disponibilité</button></div><div className="section-title"><h2>Offres récentes</h2><button onClick={onRefresh}>Actualiser</button></div><div className="cards">{offers.length ? offers.map(offer => <article key={`${offer.kind}-${offer.id}`}><p className="tag">{offer.kind}</p><h3>{offer.title}</h3><p>{offer.details || "Détails à préciser"}</p><strong>{offer.price}</strong></article>) : <p>Aucune offre active pour le moment.</p>}</div></section>;
}

function Login({ onDone, onNotice }: { onDone: () => void; onNotice: (value: string) => void }) {
  const [phone, setPhone] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState(""); const [mode, setMode] = useState<"signin" | "signup">("signin"); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return; setBusy(true); onNotice("");
    const email = phoneToEmail(phone);
    const result = mode === "signin" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim(), phone: phone.replace(/\s/g, "") } } });
    setBusy(false); if (result.error) { onNotice(result.error.message); return; } onNotice(mode === "signup" ? "Compte créé. Vous pouvez maintenant choisir votre profil sur le site ou publier une offre." : "Connexion réussie."); onDone();
  }
  return <section><h1>{mode === "signin" ? "Connexion" : "Créer un compte"}</h1><form onSubmit={submit}>{mode === "signup" && <label>Nom complet<input value={name} required onChange={e => setName(e.target.value)} /></label>}<label>Téléphone<input type="tel" value={phone} required onChange={e => setPhone(e.target.value)} /></label><label>Mot de passe<input type="password" minLength={6} value={password} required onChange={e => setPassword(e.target.value)} /></label><button className="primary" disabled={busy}>{busy ? "…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}</button></form><button className="link" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Créer un compte" : "J’ai déjà un compte"}</button></section>;
}

function Publish({ user, onNotice, onDone }: { user: User | null; onNotice: (value: string) => void; onDone: () => void }) {
  const [kind, setKind] = useState<"local" | "gp">("local"); const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [price, setPrice] = useState(""); const [date, setDate] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!supabase || !user) return;
    const result = kind === "local"
      ? await supabase.from("local_availabilities").insert({ transporter_id: user.id, location: from, district: to, price_label: price, status: "active" })
      : await supabase.from("gp_trips").insert({ transporter_id: user.id, origin_city: from, destination_city: to, departure_at: date || null, price_label: price, status: "active" });
    if (result.error) { onNotice(result.error.message); return; } onNotice("Disponibilité publiée."); onDone();
  }
  if (!user) return <section><h1>Publier</h1><p>Connectez-vous pour publier une disponibilité.</p></section>;
  return <section><h1>Publier une disponibilité</h1><form onSubmit={submit}><label>Service<select value={kind} onChange={e => setKind(e.target.value as "local" | "gp")}><option value="local">Tiak-Tiak local</option><option value="gp">GP international</option></select></label><label>{kind === "local" ? "Ville / zone" : "Ville de départ"}<input required value={from} onChange={e => setFrom(e.target.value)} /></label><label>{kind === "local" ? "Quartier / couverture" : "Destination"}<input required value={to} onChange={e => setTo(e.target.value)} /></label>{kind === "gp" && <label>Date de départ<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>}<label>Tarif indicatif<input required value={price} onChange={e => setPrice(e.target.value)} /></label><button className="primary">Publier</button></form></section>;
}

function Account({ user, onNotice }: { user: User | null; onNotice: (value: string) => void }) {
  async function requestDeletion() { if (!supabase || !user || !window.confirm("Demander la suppression définitive de votre compte ?")) return; const { error } = await supabase.from("account_deletion_requests").insert({ user_id: user.id, status: "requested" }); onNotice(error && error.code !== "23505" ? "La demande n’a pas pu être envoyée." : "Demande de suppression enregistrée."); }
  async function signOut() { await supabase?.auth.signOut(); onNotice("Vous êtes déconnecté."); }
  if (!user) return <section><h1>Mon compte</h1><p>Connectez-vous pour gérer votre compte.</p></section>;
  return <section><h1>Mon compte</h1><p>Connecté avec votre numéro YobbuGo.</p><button className="primary" onClick={() => void signOut()}>Se déconnecter</button><hr /><h2>Supprimer mon compte</h2><p>Vous pouvez demander la suppression de votre compte et des données associées.</p><button className="danger" onClick={() => void requestDeletion()}>Demander la suppression</button></section>;
}

createRoot(document.getElementById("root")!).render(<App />);
