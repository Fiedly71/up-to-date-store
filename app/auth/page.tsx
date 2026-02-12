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
        // After signup, show message to check email
        setError("Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail.");
        setLoading(false);
        return;
      }
      // Vérifie le rôle (admin ou client) via la table profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (profile && profile.is_admin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/my-orders";
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 via-blue-950 to-purple-900">
      <Navbar />
      <div className="w-full max-w-md mt-16 bg-white/95 rounded-2xl shadow-2xl border border-blue-100 p-8 backdrop-blur-lg">
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow">{showLogin ? "Connexion" : "Créer un compte"}</h2>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-medium placeholder-gray-400 shadow-sm" placeholder="Votre email" />
          </div>
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium placeholder-gray-400 shadow-sm" placeholder="Votre mot de passe" />
          </div>
          {error && <div className={`rounded-xl px-4 py-3 text-center font-semibold mb-2 ${error.includes('vérification') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-blue-800 hover:to-purple-800 transition-all duration-200">
            {loading ? "Chargement..." : showLogin ? "Se connecter" : "Créer un compte"}
          </button>
        </form>
        <div className="mt-6 text-center">
          {showLogin ? (
            <span className="text-gray-700">Pas encore de compte ? <button className="text-purple-700 font-bold hover:underline" onClick={() => setShowLogin(false)}>Créer un compte</button></span>
          ) : (
            <span className="text-gray-700">Déjà inscrit ? <button className="text-purple-700 font-bold hover:underline" onClick={() => setShowLogin(true)}>Se connecter</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
