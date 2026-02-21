"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Save, CheckCircle, AlertCircle, Loader2, Edit3 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

export default function MesInfosPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const meta = user.user_metadata || {};
      setFirstName(meta.first_name || "");
      setLastName(meta.last_name || "");
      setPhone(meta.phone || "");
      setCity(meta.city || "");
      setAddress(meta.address || "");
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          updates: { first_name: firstName, last_name: lastName, phone, city, address },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccess("Informations mises à jour avec succès !");
      setEditing(false);
      // Refresh user metadata locally
      await supabase.auth.refreshSession();
      const { data: { user: refreshed } } = await supabase.auth.getUser();
      if (refreshed) setUser(refreshed);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const hasInfo = firstName || lastName || phone || city || address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />

      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              Mes Informations
            </h1>
            <p className="text-gray-600 text-sm">Gérez vos informations personnelles</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement...</p>
          </div>
        )}

        {/* Not logged in */}
        {!loading && !user && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-orange-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-8">Veuillez vous connecter pour gérer vos informations.</p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* Profile form */}
        {!loading && user && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            {/* Avatar + Email header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold border-4 border-white/30">
                {(firstName || user.email)?.[0]?.toUpperCase() || "?"}
              </div>
              <p className="text-white/90 font-medium">{user.email}</p>
              {firstName && lastName && (
                <p className="text-white text-xl font-bold mt-1">{firstName} {lastName}</p>
              )}
            </div>

            {/* Alert if info is missing */}
            {!hasInfo && !editing && (
              <div className="mx-6 mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-orange-800">Complétez votre profil</p>
                  <p className="text-orange-700 text-sm">Ajoutez vos informations personnelles pour que nous puissions mieux vous servir.</p>
                </div>
              </div>
            )}

            {/* Success/Error messages */}
            {success && (
              <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <p className="font-semibold text-green-700">{success}</p>
              </div>
            )}
            {error && (
              <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="font-semibold text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => { setFirstName(e.target.value); setEditing(true); }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                      placeholder="Jean"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => { setLastName(e.target.value); setEditing(true); }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                      placeholder="Baptiste"
                    />
                  </div>
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl text-gray-500 bg-gray-50 font-medium cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setEditing(true); }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                    placeholder="+509 32 83 6938"
                  />
                </div>
              </div>

              {/* City + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={city}
                      onChange={e => { setCity(e.target.value); setEditing(true); }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                      placeholder="Cap-Haïtien"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={address}
                      onChange={e => { setAddress(e.target.value); setEditing(true); }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                      placeholder="Rue, Quartier..."
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || !editing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : editing ? (
                    <>
                      <Save size={20} />
                      Enregistrer les modifications
                    </>
                  ) : (
                    <>
                      <Edit3 size={20} />
                      Modifiez un champ pour sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Account info */}
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 space-y-1">
                <p>Compte créé le : {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                {user.last_sign_in_at && (
                  <p>Dernière connexion : {new Date(user.last_sign_in_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
