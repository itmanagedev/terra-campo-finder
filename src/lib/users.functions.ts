import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const createAdminUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        password: z.string().min(6).max(128),
        makeAdmin: z.boolean().optional().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify caller is admin
    const { data: roleData, error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleErr) throw new Error(roleErr.message);
    if (!roleData) throw new Error('Acesso negado. Apenas administradores podem criar usuários.');

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (error) throw new Error(error.message);
    if (!created.user) throw new Error('Falha ao criar usuário.');

    if (data.makeAdmin) {
      const { error: insErr } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: created.user.id, role: 'admin' });
      if (insErr) throw new Error(insErr.message);
    }

    return { ok: true, userId: created.user.id, email: created.user.email };
  });
