-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.budget_status AS ENUM ('draft', 'closed');
CREATE TYPE public.import_source AS ENUM ('ofx', 'print', 'manual');
CREATE TYPE public.import_status AS ENUM ('processing', 'completed', 'failed');
CREATE TYPE public.confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'delete');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  partner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- USER_ROLES TABLE (Security Definer Pattern)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
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

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'circle',
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BANK_ACCOUNTS TABLE
-- ============================================
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  agency TEXT,
  account_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts" ON public.bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CREDIT_CARDS TABLE
-- ============================================
CREATE TABLE public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_four TEXT,
  total_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  budget_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit cards" ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit cards" ON public.credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BUDGET_MONTHS TABLE
-- ============================================
CREATE TABLE public.budget_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  status public.budget_status NOT NULL DEFAULT 'draft',
  closed_at TIMESTAMPTZ,
  cloned_from UUID REFERENCES public.budget_months(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, month)
);

ALTER TABLE public.budget_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget months" ON public.budget_months
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget months" ON public.budget_months
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget months" ON public.budget_months
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget months" ON public.budget_months
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FIXED_EXPENSES TABLE
-- ============================================
CREATE TABLE public.fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_month_id UUID NOT NULL REFERENCES public.budget_months(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_day INT CHECK (due_day >= 1 AND due_day <= 31),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fixed expenses" ON public.fixed_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fixed expenses" ON public.fixed_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fixed expenses" ON public.fixed_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fixed expenses" ON public.fixed_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BUDGET_CATEGORIES TABLE
-- ============================================
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_month_id UUID NOT NULL REFERENCES public.budget_months(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  planned_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (budget_month_id, category_id)
);

ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget categories" ON public.budget_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget categories" ON public.budget_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget categories" ON public.budget_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget categories" ON public.budget_categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- IMPORT_BATCHES TABLE
-- ============================================
CREATE TABLE public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_type public.import_source NOT NULL,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  status public.import_status NOT NULL DEFAULT 'processing',
  transaction_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own import batches" ON public.import_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own import batches" ON public.import_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import batches" ON public.import_batches
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  budget_month_id UUID REFERENCES public.budget_months(id) ON DELETE SET NULL,
  external_id TEXT,
  merchant TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  confidence public.confidence_level NOT NULL DEFAULT 'low',
  source public.import_source NOT NULL DEFAULT 'manual',
  is_internal BOOLEAN NOT NULL DEFAULT false,
  needs_review BOOLEAN NOT NULL DEFAULT true,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- AUDIT_LOG TABLE
-- ============================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action public.audit_action NOT NULL,
  old_values JSONB,
  new_values JSONB,
  edited_after_close BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_transactions_budget_month ON public.transactions(budget_month_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_transactions_needs_review ON public.transactions(user_id, needs_review) WHERE needs_review = true;
CREATE UNIQUE INDEX idx_transactions_external_id ON public.transactions(user_id, external_id) WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX idx_import_batches_hash ON public.import_batches(user_id, file_hash);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_budget_categories_month ON public.budget_categories(budget_month_id);
CREATE INDEX idx_fixed_expenses_month ON public.fixed_expenses(budget_month_id);

-- ============================================
-- FUNCTION: Handle New User (Create Profile + Default Categories)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );

  -- Create default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create default categories
  INSERT INTO public.categories (user_id, name, icon, color, sort_order) VALUES
    (NEW.id, 'Moradia', 'home', 'bg-blue-500', 1),
    (NEW.id, 'Alimentação', 'utensils', 'bg-orange-500', 2),
    (NEW.id, 'Transporte', 'car', 'bg-green-500', 3),
    (NEW.id, 'Saúde', 'heart-pulse', 'bg-red-500', 4),
    (NEW.id, 'Lazer', 'gamepad-2', 'bg-purple-500', 5),
    (NEW.id, 'Educação', 'graduation-cap', 'bg-indigo-500', 6),
    (NEW.id, 'Vestuário', 'shirt', 'bg-pink-500', 7),
    (NEW.id, 'Outros', 'circle-dot', 'bg-gray-500', 8);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update Updated_At Timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_months_updated_at
  BEFORE UPDATE ON public.budget_months
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixed_expenses_updated_at
  BEFORE UPDATE ON public.fixed_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION: Clone Previous Month Budget
-- ============================================
CREATE OR REPLACE FUNCTION public.clone_previous_month(_user_id UUID, _year INT, _month INT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prev_year INT;
  _prev_month INT;
  _prev_budget_id UUID;
  _new_budget_id UUID;
BEGIN
  -- Calculate previous month
  IF _month = 1 THEN
    _prev_year := _year - 1;
    _prev_month := 12;
  ELSE
    _prev_year := _year;
    _prev_month := _month - 1;
  END IF;

  -- Find previous budget
  SELECT id INTO _prev_budget_id
  FROM public.budget_months
  WHERE user_id = _user_id AND year = _prev_year AND month = _prev_month;

  -- Create new budget month
  INSERT INTO public.budget_months (user_id, year, month, cloned_from)
  VALUES (_user_id, _year, _month, _prev_budget_id)
  RETURNING id INTO _new_budget_id;

  -- Clone fixed expenses if previous exists
  IF _prev_budget_id IS NOT NULL THEN
    INSERT INTO public.fixed_expenses (budget_month_id, user_id, name, amount, due_day)
    SELECT _new_budget_id, user_id, name, amount, due_day
    FROM public.fixed_expenses
    WHERE budget_month_id = _prev_budget_id;

    -- Clone budget categories
    INSERT INTO public.budget_categories (budget_month_id, category_id, user_id, planned_amount)
    SELECT _new_budget_id, category_id, user_id, planned_amount
    FROM public.budget_categories
    WHERE budget_month_id = _prev_budget_id;
  END IF;

  RETURN _new_budget_id;
END;
$$;

-- ============================================
-- FUNCTION: Log Audit Changes
-- ============================================
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _action public.audit_action;
  _old_values JSONB;
  _new_values JSONB;
  _edited_after_close BOOLEAN := false;
  _budget_month_id UUID;
  _budget_status public.budget_status;
BEGIN
  -- Determine user_id and action
  IF TG_OP = 'DELETE' THEN
    _user_id := OLD.user_id;
    _action := 'delete';
    _old_values := to_jsonb(OLD);
    _budget_month_id := OLD.budget_month_id;
  ELSIF TG_OP = 'UPDATE' THEN
    _user_id := NEW.user_id;
    _action := 'update';
    _old_values := to_jsonb(OLD);
    _new_values := to_jsonb(NEW);
    _budget_month_id := NEW.budget_month_id;
  ELSE
    _user_id := NEW.user_id;
    _action := 'create';
    _new_values := to_jsonb(NEW);
    _budget_month_id := NEW.budget_month_id;
  END IF;

  -- Check if budget month is closed
  IF _budget_month_id IS NOT NULL THEN
    SELECT status INTO _budget_status
    FROM public.budget_months
    WHERE id = _budget_month_id;
    
    IF _budget_status = 'closed' THEN
      _edited_after_close := true;
    END IF;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_log (user_id, entity_type, entity_id, action, old_values, new_values, edited_after_close)
  VALUES (
    _user_id,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    _action,
    _old_values,
    _new_values,
    _edited_after_close
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

CREATE TRIGGER audit_budget_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();