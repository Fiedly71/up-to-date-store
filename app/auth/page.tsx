"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, CheckCircle, ArrowLeft, KeyRound } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Handle email confirmation and password reset callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const refreshToken = hashParams.get('refresh_token');
      
      // Handle password reset callback
      if (accessToken && type === 'recovery') {
        // Set the session for password reset
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        setAuthMode('reset');
        setSuccess("Entrez votre nouveau mot de passe.");
        window.history.replaceState(null, '', '/auth');
        return;
      }

      if (accessToken && type === 'signup') {
        // Email was confirmed
        setEmailConfirmed(true);
        setSuccess("✅ Email confirmé avec succès ! Vous pouvez maintenant vous connecter.");
        setAuthMode('login');
        // Clear the hash from URL
        window.history.replaceState(null, '', '/auth');
      }
      
      // Also check URL params for Supabase v2 style
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('confirmed') === 'true') {
        setEmailConfirmed(true);
        setSuccess("✅ Email confirmé avec succès ! Vous pouvez maintenant vous connecter.");
        setAuthMode('login');
      }
    };

    handleAuthCallback();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User just signed in after email confirmation
        window.location.href = '/my-orders';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Validation du formulaire signup
  function validateSignup(): string | null {
    if (!firstName.trim()) return "Le prénom est requis.";
    if (!lastName.trim()) return "Le nom est requis.";
    if (!email.trim() || !email.includes("@")) return "Email invalide.";
    if (!phone.trim() || phone.length < 8) return "Numéro de téléphone invalide.";
    if (!city.trim()) return "La ville est requise.";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas.";
    return null;
  }

  // Handle forgot password
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Veuillez entrer une adresse email valide.");
      }

      const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth`,
      });

      if (error) throw error;

      setSuccess("✅ Un email de réinitialisation a été envoyé ! Vérifiez votre boîte mail.");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setLoading(false);
    }
  }

  // Handle reset password (new password submission)
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (newPassword.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess("✅ Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setAuthMode('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification du mot de passe.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (authMode === 'login') {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Verify role and redirect - try multiple methods
        let isAdmin = false;
        
        // Method 1: Try to get profile directly
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();
        
        if (profile && profile.is_admin === true) {
          isAdmin = true;
        }
        
        // Method 2: Also check by email if profile query failed
        if (!profile || profileError) {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('email', data.user.email)
            .single();
          
          if (profileByEmail && profileByEmail.is_admin === true) {
            isAdmin = true;
          }
        }
        
        console.log('Login - User ID:', data.user.id, 'Email:', data.user.email, 'Is Admin:', isAdmin, 'Profile:', profile);
        
        if (isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/my-orders";
        }
      } else if (authMode === 'signup') {
        // SIGNUP - Validation
        const validationError = validateSignup();
        if (validationError) {
          setError(validationError);
          setLoading(false);
          return;
        }

        // Create account with metadata
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/auth?confirmed=true`,
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              city: city,
              address: address,
            }
          }
        });
        if (error) throw error;

        // Insert into profiles table
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            city: city,
            address: address,
            is_admin: false,
          });
        }

        setSuccess("✅ Compte créé avec succès ! Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail pour activer votre compte.");
        // Reset form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setCity("");
        setAddress("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-purple-900">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl border border-blue-100 p-8 backdrop-blur-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {authMode === 'reset' || authMode === 'forgot' ? (
                <KeyRound className="text-white" size={32} />
              ) : (
                <User className="text-white" size={32} />
              )}
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              {authMode === 'login' && "Connexion"}
              {authMode === 'signup' && "Créer un compte"}
              {authMode === 'forgot' && "Mot de passe oublié"}
              {authMode === 'reset' && "Nouveau mot de passe"}
            </h2>
            <p className="text-gray-600 mt-2">
              {authMode === 'login' && "Accédez à votre espace client"}
              {authMode === 'signup' && "Rejoignez Up-to-date Store"}
              {authMode === 'forgot' && "Entrez votre email pour réinitialiser"}
              {authMode === 'reset' && "Choisissez un nouveau mot de passe"}
            </p>
          </div>

          {/* Back button for forgot/reset */}
          {(authMode === 'forgot' || authMode === 'reset') && (
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(""); setSuccess(""); }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
            >
              <ArrowLeft size={18} />
              Retour à la connexion
            </button>
          )}

          {/* Toggle Buttons (only for login/signup) */}
          {(authMode === 'login' || authMode === 'signup') && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 ${authMode === 'login' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 ${authMode === 'signup' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Inscription
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-center font-semibold bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl px-4 py-3 text-center font-semibold bg-green-50 text-green-700 border border-green-200">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Nouveau mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Confirmer le nouveau mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  {confirmNewPassword && newPassword === confirmNewPassword && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-center font-semibold bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl px-4 py-3 text-center font-semibold bg-green-50 text-green-700 border border-green-200">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          )}

          {/* LOGIN/SIGNUP FORM */}
          {(authMode === 'login' || authMode === 'signup') && (
          <form onSubmit={handleAuth} className="space-y-5">
            {/* Signup Fields */}
            {authMode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Prénom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                        placeholder="Jean"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Nom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                        placeholder="Baptiste"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                      placeholder="+509 32 83 6938"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Ville *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                        placeholder="Cap-Haïtien"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Adresse</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                      placeholder="Rue, Quartier..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password link (login only) */}
            {authMode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setError(""); setSuccess(""); }}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                  )}
                </div>
              </div>
            )}

            {/* Error / Success Messages */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-center font-semibold bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl px-4 py-3 text-center font-semibold bg-green-50 text-green-700 border border-green-200">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Chargement...
                </span>
              ) : authMode === 'login' ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
          )}

          {/* Footer */}
          {(authMode === 'login' || authMode === 'signup') && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <span>Pas encore de compte ? <button className="text-purple-700 font-bold hover:underline" onClick={() => { setAuthMode('signup'); setError(""); setSuccess(""); }}>Créer un compte</button></span>
            ) : (
              <span>Déjà inscrit ? <button className="text-purple-700 font-bold hover:underline" onClick={() => { setAuthMode('login'); setError(""); setSuccess(""); }}>Se connecter</button></span>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
