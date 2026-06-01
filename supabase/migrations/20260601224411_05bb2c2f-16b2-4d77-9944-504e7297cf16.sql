
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Properties
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  area numeric NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
ON public.properties FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert properties"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update properties"
ON public.properties FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete properties"
ON public.properties FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER properties_set_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial properties
INSERT INTO public.properties (title, type, city, state, area, price, description, image) VALUES
('Fazenda Boa Vista','Fazenda','Goiânia','GO',320,2800000,'Fazenda com pastagem formada, açude, casa sede e energia elétrica.','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'),
('Sítio Recanto Verde','Sítio','Campinas','SP',18,480000,'Sítio com pomar, casa de alvenaria, poço artesiano e nascente.','https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600'),
('Chácara Sol Nascente','Chácara','Cuiabá','MT',5,195000,'Chácara com infraestrutura completa, cercada e com acesso asfaltado.','https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=600'),
('Fazenda Horizonte','Fazenda','Palmas','TO',540,4200000,'Fazenda com 540 ha, certificada, ótima localização e topografia plana.','https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600'),
('Sítio Água Viva','Sítio','Uberlândia','MG',25,620000,'Sítio com rio perene, benfeitorias, curral e galpão de máquinas.','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'),
('Chácara Bela Vista','Chácara','Anápolis','GO',8,310000,'Chácara com lago artificial, churrasqueira, piscina e pomar variado.','https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600');
