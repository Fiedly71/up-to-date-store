"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirection après login selon le rôle (admin ou client)
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userData;
      if (showLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        userData = data.user;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        userData = data.user;
      }
      // Vérifie le rôle (admin ou client)
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email?.endsWith("@admin.com")) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/my-orders";
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <Navbar />
      <div className="w-full max-w-md mt-16 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{showLogin ? "Connexion" : "Créer un compte"}</h2>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all">
            {loading ? "Chargement..." : showLogin ? "Se connecter" : "Créer un compte"}
          </button>
        </form>
        <div className="mt-6 text-center">
          {showLogin ? (
            <span>Pas encore de compte ? <button className="text-blue-600 font-bold hover:underline" onClick={() => setShowLogin(false)}>Créer un compte</button></span>
          ) : (
            <span>Déjà inscrit ? <button className="text-blue-600 font-bold hover:underline" onClick={() => setShowLogin(true)}>Se connecter</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
