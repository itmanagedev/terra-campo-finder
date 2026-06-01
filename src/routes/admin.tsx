import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "@/lib/users.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Terra & Campo" }] }),
  component: AdminPage,
});

type Property = {
  id: string;
  title: string;
  type: string;
  city: string;
  state: string;
  area: number;
  price: number;
  description: string;
  image: string;
  created_at: string;
};

const emptyForm = {
  title: "",
  type: "Fazenda",
  city: "",
  state: "",
  area: "",
  price: "",
  description: "",
  image: "",
};

function AdminPage() {
  const navigate = useNavigate();
  const callCreateUser = useServerFn(createAdminUser);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // New-user form
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserMakeAdmin, setNewUserMakeAdmin] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadProperties = useCallback(async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProperties(data as Property[]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      setEmail(sess.session.user.email ?? null);
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleData);
      setChecking(false);
      if (roleData) loadProperties();
    })();
  }, [navigate, loadProperties]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setMsg(null);
  };

  const startEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      type: p.type,
      city: p.city,
      state: p.state,
      area: String(p.area),
      price: String(p.price),
      description: p.description,
      image: p.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const payload = {
      title: form.title.trim(),
      type: form.type,
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      area: Number(form.area),
      price: Number(form.price),
      description: form.description.trim(),
      image: form.image.trim(),
    };
    const { error } = editingId
      ? await supabase.from("properties").update(payload).eq("id", editingId)
      : await supabase.from("properties").insert(payload);
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    resetForm();
    loadProperties();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta propriedade?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    loadProperties();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMsg(null);
    try {
      await callCreateUser({
        data: {
          email: newUserEmail.trim(),
          password: newUserPassword,
          makeAdmin: newUserMakeAdmin,
        },
      });
      setUserMsg({ type: "ok", text: `Usuário ${newUserEmail} criado com sucesso.` });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserMakeAdmin(true);
    } catch (err: unknown) {
      setUserMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Erro ao criar usuário",
      });
    } finally {
      setCreatingUser(false);
    }
  };


  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center bg-card rounded-2xl p-8 shadow ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-foreground">Acesso negado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta ({email}) ainda não tem permissão de administrador.
            <br />
            Peça ao responsável para liberar seu acesso.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={logout}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium"
            >
              Sair
            </button>
            <Link
              to="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Ir para o site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Painel Administrativo</h1>
            <p className="text-xs opacity-80">{email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              Ver site
            </Link>
            <button
              onClick={logout}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        <section className="bg-card rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {editingId ? "Editar propriedade" : "Nova propriedade"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Field label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <div>
              <label className="block text-sm font-medium text-foreground">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option>Fazenda</option>
                <option>Sítio</option>
                <option>Chácara</option>
              </select>
            </div>
            <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <Field label="Estado (UF)" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required maxLength={2} />
            <Field label="Área (hectares)" type="number" value={form.area} onChange={(v) => setForm({ ...form, area: v })} required />
            <Field label="Preço (R$)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
            <Field label="URL da imagem" value={form.image} onChange={(v) => setForm({ ...form, image: v })} className="md:col-span-2" />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            {msg && (
              <p className="md:col-span-2 text-sm text-destructive bg-destructive/10 rounded p-2">
                {msg}
              </p>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar propriedade"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Propriedades cadastradas ({properties.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-card rounded-xl ring-1 ring-black/5 overflow-hidden flex flex-col"
              >
                {p.image && (
                  <img src={p.image} alt={p.title} className="aspect-[4/3] w-full object-cover" />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs uppercase tracking-wider text-accent">{p.type}</p>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.city}/{p.state} · {p.area} ha
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary">
                    R$ {Number(p.price).toLocaleString("pt-BR")}
                  </p>
                  <div className="mt-auto pt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/70"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="flex-1 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm font-medium hover:bg-destructive/20"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {properties.length === 0 && (
              <p className="text-muted-foreground">Nenhuma propriedade cadastrada.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
