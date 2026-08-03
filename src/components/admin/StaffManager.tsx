"use client";

import { useEffect, useState } from "react";

type Staff = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "CASHIER";
  active: boolean;
  twoFactorEnabled: boolean;
};

export function StaffManager({ gate }: { gate: string }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch(`/${gate}/api/staff`)
      .then((res) => res.json())
      .then((data) => setStaff(data.staff ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/${gate}/api/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        role: String(form.get("role")),
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Compte créé." : data.error ?? "Erreur.");
    if (res.ok) {
      setShowForm(false);
      load();
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/${gate}/api/staff`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error);
    load();
  }

  async function changeRole(id: string, role: "SUPER_ADMIN" | "CASHIER") {
    const res = await fetch(`/${gate}/api/staff`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error);
    load();
  }

  return (
    <div>
      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-4 rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
      >
        + Ajouter un compte staff
      </button>

      {message && <p className="mb-4 text-sm text-[#2F6F4F]">{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-2">
          <input name="name" placeholder="Nom" required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <input name="email" type="email" placeholder="Email" required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <input name="password" type="password" placeholder="Mot de passe temporaire" minLength={8} required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <select name="role" className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm">
            <option value="CASHIER">Caissier</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <button type="submit" className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white md:col-span-2">
            Créer le compte
          </button>
        </form>
      )}

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">2FA</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-[#E9ECEF]">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-[#6C757D]">{s.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={s.role}
                    onChange={(e) => changeRole(s.id, e.target.value as "SUPER_ADMIN" | "CASHIER")}
                    className="rounded border border-[#E9ECEF] px-2 py-1 text-xs"
                  >
                    <option value="CASHIER">Caissier</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-[#6C757D]">
                  {s.twoFactorEnabled ? "Activée" : "Non activée"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(s.id, !s.active)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      s.active ? "bg-[#F8F9FA] text-[#6C757D]" : "bg-[#2F6F4F] text-white"
                    }`}
                  >
                    {s.active ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
