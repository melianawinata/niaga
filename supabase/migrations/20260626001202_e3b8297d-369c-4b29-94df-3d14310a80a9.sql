
-- ============== ENUMS ==============
CREATE TYPE public.app_role AS ENUM ('pemilik','kasir','gudang','keuangan');
CREATE TYPE public.jenis_bayar AS ENUM ('tunai','kredit');
CREATE TYPE public.tipe_hutpiut AS ENUM ('hutang','piutang');
CREATE TYPE public.status_hutpiut AS ENUM ('BELUM','SEBAGIAN','LUNAS');
CREATE TYPE public.tipe_gerakan AS ENUM ('in','out','adj');
CREATE TYPE public.status_pembelian AS ENUM ('draft','dikirim','diterima','batal');

-- ============== TENANTS ==============
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_usaha TEXT NOT NULL,
  paket TEXT NOT NULL DEFAULT 'starter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ============== PROFILES ==============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.profiles(tenant_id);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============== USER ROLES ==============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role, tenant_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============== HELPER FUNCTIONS ==============
CREATE OR REPLACE FUNCTION public.current_tenant(_uid UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _uid;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_uid UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role IN ('pemilik','keuangan'));
$$;

-- ============== RLS POLICIES (tenants, profiles, roles) ==============
CREATE POLICY tenants_select ON public.tenants FOR SELECT TO authenticated
  USING (id = public.current_tenant(auth.uid()));
CREATE POLICY tenants_update ON public.tenants FOR UPDATE TO authenticated
  USING (id = public.current_tenant(auth.uid()) AND public.has_role(auth.uid(),'pemilik'));

CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY roles_select ON public.user_roles FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));

-- ============== MASTER DATA ==============
CREATE TABLE public.kategori (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.kategori(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kategori TO authenticated;
GRANT ALL ON public.kategori TO service_role;
ALTER TABLE public.kategori ENABLE ROW LEVEL SECURITY;
CREATE POLICY kategori_all ON public.kategori FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()))
  WITH CHECK (tenant_id = public.current_tenant(auth.uid()));

CREATE TABLE public.produk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  nama TEXT NOT NULL,
  kategori_id UUID REFERENCES public.kategori(id) ON DELETE SET NULL,
  satuan TEXT NOT NULL DEFAULT 'pcs',
  harga_beli NUMERIC(14,2) NOT NULL DEFAULT 0,
  harga_jual NUMERIC(14,2) NOT NULL DEFAULT 0,
  stok NUMERIC(14,2) NOT NULL DEFAULT 0,
  stok_min NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku)
);
CREATE INDEX ON public.produk(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produk TO authenticated;
GRANT ALL ON public.produk TO service_role;
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;
CREATE POLICY produk_select ON public.produk FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));
CREATE POLICY produk_mutate ON public.produk FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()))
  WITH CHECK (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()));

CREATE TABLE public.supplier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kontak TEXT,
  saldo_hutang NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.supplier(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier TO authenticated;
GRANT ALL ON public.supplier TO service_role;
ALTER TABLE public.supplier ENABLE ROW LEVEL SECURITY;
CREATE POLICY supplier_select ON public.supplier FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));
CREATE POLICY supplier_mutate ON public.supplier FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()))
  WITH CHECK (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()));

CREATE TABLE public.pelanggan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kontak TEXT,
  saldo_piutang NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.pelanggan(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pelanggan TO authenticated;
GRANT ALL ON public.pelanggan TO service_role;
ALTER TABLE public.pelanggan ENABLE ROW LEVEL SECURITY;
CREATE POLICY pelanggan_select ON public.pelanggan FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));
CREATE POLICY pelanggan_mutate ON public.pelanggan FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()))
  WITH CHECK (tenant_id = public.current_tenant(auth.uid()));

CREATE TABLE public.akun_kas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  saldo NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.akun_kas(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.akun_kas TO authenticated;
GRANT ALL ON public.akun_kas TO service_role;
ALTER TABLE public.akun_kas ENABLE ROW LEVEL SECURITY;
CREATE POLICY kas_select ON public.akun_kas FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()));
CREATE POLICY kas_mutate ON public.akun_kas FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND public.has_role(auth.uid(),'pemilik'))
  WITH CHECK (tenant_id = public.current_tenant(auth.uid()) AND public.has_role(auth.uid(),'pemilik'));

-- ============== TRANSAKSI ==============
CREATE TABLE public.penjualan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nomor TEXT NOT NULL,
  pelanggan_id UUID REFERENCES public.pelanggan(id) ON DELETE SET NULL,
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now(),
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  hpp_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  jenis_bayar jenis_bayar NOT NULL,
  jatuh_tempo DATE,
  kasir_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  akun_kas_id UUID REFERENCES public.akun_kas(id) ON DELETE SET NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.penjualan(tenant_id, tanggal DESC);
GRANT SELECT, INSERT ON public.penjualan TO authenticated;
GRANT ALL ON public.penjualan TO service_role;
ALTER TABLE public.penjualan ENABLE ROW LEVEL SECURITY;
CREATE POLICY penjualan_select ON public.penjualan FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND
    (public.is_admin(auth.uid()) OR kasir_id = auth.uid()));

CREATE TABLE public.pembelian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nomor TEXT NOT NULL,
  supplier_id UUID REFERENCES public.supplier(id) ON DELETE SET NULL,
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now(),
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  status status_pembelian NOT NULL DEFAULT 'draft',
  jenis_bayar jenis_bayar NOT NULL,
  jatuh_tempo DATE,
  akun_kas_id UUID REFERENCES public.akun_kas(id) ON DELETE SET NULL,
  dibuat_oleh UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.pembelian(tenant_id, tanggal DESC);
GRANT SELECT, INSERT, UPDATE ON public.pembelian TO authenticated;
GRANT ALL ON public.pembelian TO service_role;
ALTER TABLE public.pembelian ENABLE ROW LEVEL SECURITY;
CREATE POLICY pembelian_all ON public.pembelian FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()))
  WITH CHECK (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()));

CREATE TABLE public.detail_transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  penjualan_id UUID REFERENCES public.penjualan(id) ON DELETE CASCADE,
  pembelian_id UUID REFERENCES public.pembelian(id) ON DELETE CASCADE,
  produk_id UUID NOT NULL REFERENCES public.produk(id),
  qty NUMERIC(14,2) NOT NULL,
  harga NUMERIC(14,2) NOT NULL,
  hpp NUMERIC(14,2) NOT NULL DEFAULT 0,
  CHECK (penjualan_id IS NOT NULL OR pembelian_id IS NOT NULL)
);
CREATE INDEX ON public.detail_transaksi(penjualan_id);
CREATE INDEX ON public.detail_transaksi(pembelian_id);
GRANT SELECT, INSERT ON public.detail_transaksi TO authenticated;
GRANT ALL ON public.detail_transaksi TO service_role;
ALTER TABLE public.detail_transaksi ENABLE ROW LEVEL SECURITY;
CREATE POLICY detail_select ON public.detail_transaksi FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));

CREATE TABLE public.pergerakan_stok (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  produk_id UUID NOT NULL REFERENCES public.produk(id) ON DELETE CASCADE,
  tipe tipe_gerakan NOT NULL,
  qty NUMERIC(14,2) NOT NULL,
  sumber_tipe TEXT,
  sumber_id UUID,
  alasan TEXT,
  oleh UUID REFERENCES auth.users(id),
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.pergerakan_stok(tenant_id, produk_id, tanggal DESC);
GRANT SELECT, INSERT ON public.pergerakan_stok TO authenticated;
GRANT ALL ON public.pergerakan_stok TO service_role;
ALTER TABLE public.pergerakan_stok ENABLE ROW LEVEL SECURITY;
CREATE POLICY gerakan_select ON public.pergerakan_stok FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));

CREATE TABLE public.hutang_piutang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipe tipe_hutpiut NOT NULL,
  penjualan_id UUID REFERENCES public.penjualan(id) ON DELETE CASCADE,
  pembelian_id UUID REFERENCES public.pembelian(id) ON DELETE CASCADE,
  pelanggan_id UUID REFERENCES public.pelanggan(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.supplier(id) ON DELETE SET NULL,
  total NUMERIC(14,2) NOT NULL,
  sisa NUMERIC(14,2) NOT NULL,
  jatuh_tempo DATE NOT NULL,
  status status_hutpiut NOT NULL DEFAULT 'BELUM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.hutang_piutang(tenant_id, tipe, status);
GRANT SELECT, UPDATE ON public.hutang_piutang TO authenticated;
GRANT ALL ON public.hutang_piutang TO service_role;
ALTER TABLE public.hutang_piutang ENABLE ROW LEVEL SECURITY;
CREATE POLICY hp_select ON public.hutang_piutang FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND
    (public.is_admin(auth.uid()) OR tipe = 'piutang'));

CREATE TABLE public.pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  hutpiut_id UUID NOT NULL REFERENCES public.hutang_piutang(id) ON DELETE CASCADE,
  jumlah NUMERIC(14,2) NOT NULL,
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now(),
  akun_kas_id UUID REFERENCES public.akun_kas(id),
  oleh UUID REFERENCES auth.users(id)
);
CREATE INDEX ON public.pembayaran(tenant_id, tanggal DESC);
GRANT SELECT, INSERT ON public.pembayaran TO authenticated;
GRANT ALL ON public.pembayaran TO service_role;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY bayar_select ON public.pembayaran FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()));

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  oleh UUID REFERENCES auth.users(id),
  aksi TEXT NOT NULL,
  entitas TEXT,
  entitas_id UUID,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.audit_log(tenant_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_select ON public.audit_log FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant(auth.uid()) AND public.is_admin(auth.uid()));

-- ============== TRIGGER: handle_new_user ==============
-- Each new auth user gets their own tenant + profile + pemilik role.
-- For demo/seeded users, this is bypassed (seeded directly via service role).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _join_tenant UUID;
  _join_role app_role;
  _nama TEXT;
BEGIN
  _nama := COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email,'@',1));
  _join_tenant := NULLIF(NEW.raw_user_meta_data->>'tenant_id','')::UUID;
  _join_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::app_role, 'pemilik');

  IF _join_tenant IS NOT NULL THEN
    _tenant_id := _join_tenant;
  ELSE
    INSERT INTO public.tenants (nama_usaha) VALUES (COALESCE(NEW.raw_user_meta_data->>'nama_usaha','Usaha Saya'))
      RETURNING id INTO _tenant_id;
  END IF;

  INSERT INTO public.profiles (id, tenant_id, nama, email)
    VALUES (NEW.id, _tenant_id, _nama, NEW.email);
  INSERT INTO public.user_roles (user_id, tenant_id, role)
    VALUES (NEW.id, _tenant_id, _join_role);

  -- Default kas account for new tenant
  IF _join_tenant IS NULL THEN
    INSERT INTO public.akun_kas (tenant_id, nama, saldo) VALUES (_tenant_id, 'Kas Toko', 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== RPC: BUAT PENJUALAN ==============
CREATE OR REPLACE FUNCTION public.rpc_buat_penjualan(
  _items JSONB,                -- [{produk_id, qty, harga}]
  _jenis_bayar jenis_bayar,
  _pelanggan_id UUID DEFAULT NULL,
  _jatuh_tempo DATE DEFAULT NULL,
  _akun_kas_id UUID DEFAULT NULL,
  _catatan TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _t UUID := public.current_tenant(auth.uid());
  _p_id UUID := gen_random_uuid();
  _total NUMERIC := 0;
  _hpp_total NUMERIC := 0;
  _kas UUID := _akun_kas_id;
  _item JSONB;
  _prod RECORD;
  _qty NUMERIC;
  _harga NUMERIC;
  _nomor TEXT;
BEGIN
  IF _t IS NULL THEN RAISE EXCEPTION 'Tidak ada tenant'; END IF;
  IF _jenis_bayar = 'kredit' AND (_pelanggan_id IS NULL OR _jatuh_tempo IS NULL) THEN
    RAISE EXCEPTION 'Penjualan kredit perlu pelanggan & jatuh tempo';
  END IF;

  IF _jenis_bayar = 'tunai' AND _kas IS NULL THEN
    SELECT id INTO _kas FROM public.akun_kas WHERE tenant_id = _t ORDER BY created_at LIMIT 1;
  END IF;

  -- Validasi stok
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::NUMERIC;
    SELECT * INTO _prod FROM public.produk WHERE id = (_item->>'produk_id')::UUID AND tenant_id = _t FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produk tidak ditemukan'; END IF;
    IF _prod.stok < _qty THEN RAISE EXCEPTION 'Stok % tidak cukup (tersedia %)', _prod.nama, _prod.stok; END IF;
    _harga := COALESCE((_item->>'harga')::NUMERIC, _prod.harga_jual);
    _total := _total + (_qty * _harga);
    _hpp_total := _hpp_total + (_qty * _prod.harga_beli);
  END LOOP;

  _nomor := 'INV-' || to_char(now() AT TIME ZONE 'Asia/Jakarta','YYYYMMDD-HH24MISS') || '-' || substr(_p_id::text,1,4);

  INSERT INTO public.penjualan (id, tenant_id, nomor, pelanggan_id, total, hpp_total, jenis_bayar, jatuh_tempo, kasir_id, akun_kas_id, catatan)
    VALUES (_p_id, _t, _nomor, _pelanggan_id, _total, _hpp_total, _jenis_bayar, _jatuh_tempo, auth.uid(), _kas, _catatan);

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::NUMERIC;
    SELECT * INTO _prod FROM public.produk WHERE id = (_item->>'produk_id')::UUID;
    _harga := COALESCE((_item->>'harga')::NUMERIC, _prod.harga_jual);
    INSERT INTO public.detail_transaksi (tenant_id, penjualan_id, produk_id, qty, harga, hpp)
      VALUES (_t, _p_id, _prod.id, _qty, _harga, _prod.harga_beli);
    UPDATE public.produk SET stok = stok - _qty WHERE id = _prod.id;
    INSERT INTO public.pergerakan_stok (tenant_id, produk_id, tipe, qty, sumber_tipe, sumber_id, oleh)
      VALUES (_t, _prod.id, 'out', _qty, 'penjualan', _p_id, auth.uid());
  END LOOP;

  IF _jenis_bayar = 'tunai' THEN
    UPDATE public.akun_kas SET saldo = saldo + _total WHERE id = _kas;
  ELSE
    INSERT INTO public.hutang_piutang (tenant_id, tipe, penjualan_id, pelanggan_id, total, sisa, jatuh_tempo)
      VALUES (_t, 'piutang', _p_id, _pelanggan_id, _total, _total, _jatuh_tempo);
    UPDATE public.pelanggan SET saldo_piutang = saldo_piutang + _total WHERE id = _pelanggan_id;
  END IF;

  INSERT INTO public.audit_log (tenant_id, oleh, aksi, entitas, entitas_id, detail)
    VALUES (_t, auth.uid(), 'buat_penjualan', 'penjualan', _p_id,
      jsonb_build_object('total',_total,'jenis_bayar',_jenis_bayar));

  RETURN _p_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_buat_penjualan(JSONB,jenis_bayar,UUID,DATE,UUID,TEXT) TO authenticated;

-- ============== RPC: BUAT PEMBELIAN (langsung diterima) ==============
CREATE OR REPLACE FUNCTION public.rpc_buat_pembelian(
  _items JSONB,                -- [{produk_id, qty, harga_beli}]
  _supplier_id UUID,
  _jenis_bayar jenis_bayar,
  _jatuh_tempo DATE DEFAULT NULL,
  _akun_kas_id UUID DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _t UUID := public.current_tenant(auth.uid());
  _b_id UUID := gen_random_uuid();
  _total NUMERIC := 0;
  _kas UUID := _akun_kas_id;
  _item JSONB;
  _prod RECORD;
  _qty NUMERIC;
  _harga NUMERIC;
  _nomor TEXT;
  _new_avg NUMERIC;
BEGIN
  IF _t IS NULL THEN RAISE EXCEPTION 'Tidak ada tenant'; END IF;
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Tidak berwenang'; END IF;
  IF _jenis_bayar = 'tunai' AND _kas IS NULL THEN
    SELECT id INTO _kas FROM public.akun_kas WHERE tenant_id = _t ORDER BY created_at LIMIT 1;
  END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::NUMERIC;
    _harga := (_item->>'harga_beli')::NUMERIC;
    _total := _total + (_qty * _harga);
  END LOOP;

  _nomor := 'PO-' || to_char(now() AT TIME ZONE 'Asia/Jakarta','YYYYMMDD-HH24MISS') || '-' || substr(_b_id::text,1,4);
  INSERT INTO public.pembelian (id, tenant_id, nomor, supplier_id, total, status, jenis_bayar, jatuh_tempo, akun_kas_id, dibuat_oleh)
    VALUES (_b_id, _t, _nomor, _supplier_id, _total, 'diterima', _jenis_bayar, _jatuh_tempo, _kas, auth.uid());

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::NUMERIC;
    _harga := (_item->>'harga_beli')::NUMERIC;
    SELECT * INTO _prod FROM public.produk WHERE id = (_item->>'produk_id')::UUID AND tenant_id = _t FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produk tidak ditemukan'; END IF;
    -- weighted-average HPP
    IF (_prod.stok + _qty) > 0 THEN
      _new_avg := ((_prod.stok * _prod.harga_beli) + (_qty * _harga)) / (_prod.stok + _qty);
    ELSE
      _new_avg := _harga;
    END IF;
    INSERT INTO public.detail_transaksi (tenant_id, pembelian_id, produk_id, qty, harga, hpp)
      VALUES (_t, _b_id, _prod.id, _qty, _harga, _harga);
    UPDATE public.produk SET stok = stok + _qty, harga_beli = _new_avg WHERE id = _prod.id;
    INSERT INTO public.pergerakan_stok (tenant_id, produk_id, tipe, qty, sumber_tipe, sumber_id, oleh)
      VALUES (_t, _prod.id, 'in', _qty, 'pembelian', _b_id, auth.uid());
  END LOOP;

  IF _jenis_bayar = 'tunai' THEN
    UPDATE public.akun_kas SET saldo = saldo - _total WHERE id = _kas;
  ELSE
    INSERT INTO public.hutang_piutang (tenant_id, tipe, pembelian_id, supplier_id, total, sisa, jatuh_tempo)
      VALUES (_t, 'hutang', _b_id, _supplier_id, _total, _total, COALESCE(_jatuh_tempo, (now()::date + 30)));
    UPDATE public.supplier SET saldo_hutang = saldo_hutang + _total WHERE id = _supplier_id;
  END IF;

  INSERT INTO public.audit_log (tenant_id, oleh, aksi, entitas, entitas_id, detail)
    VALUES (_t, auth.uid(), 'buat_pembelian', 'pembelian', _b_id, jsonb_build_object('total',_total));

  RETURN _b_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_buat_pembelian(JSONB,UUID,jenis_bayar,DATE,UUID) TO authenticated;

-- ============== RPC: TERIMA PEMBAYARAN ==============
CREATE OR REPLACE FUNCTION public.rpc_terima_pembayaran(
  _hutpiut_id UUID, _jumlah NUMERIC, _akun_kas_id UUID DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _t UUID := public.current_tenant(auth.uid());
  _hp RECORD;
  _sisa NUMERIC;
  _kas UUID := _akun_kas_id;
  _id UUID := gen_random_uuid();
BEGIN
  SELECT * INTO _hp FROM public.hutang_piutang WHERE id = _hutpiut_id AND tenant_id = _t FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tagihan tidak ditemukan'; END IF;
  IF _jumlah <= 0 OR _jumlah > _hp.sisa THEN RAISE EXCEPTION 'Jumlah pembayaran tidak valid'; END IF;
  IF _kas IS NULL THEN
    SELECT id INTO _kas FROM public.akun_kas WHERE tenant_id = _t ORDER BY created_at LIMIT 1;
  END IF;

  _sisa := _hp.sisa - _jumlah;
  UPDATE public.hutang_piutang SET sisa = _sisa,
    status = CASE WHEN _sisa <= 0 THEN 'LUNAS'::status_hutpiut ELSE 'SEBAGIAN'::status_hutpiut END
    WHERE id = _hutpiut_id;

  INSERT INTO public.pembayaran (id, tenant_id, hutpiut_id, jumlah, akun_kas_id, oleh)
    VALUES (_id, _t, _hutpiut_id, _jumlah, _kas, auth.uid());

  IF _hp.tipe = 'piutang' THEN
    UPDATE public.akun_kas SET saldo = saldo + _jumlah WHERE id = _kas;
    IF _hp.pelanggan_id IS NOT NULL THEN
      UPDATE public.pelanggan SET saldo_piutang = saldo_piutang - _jumlah WHERE id = _hp.pelanggan_id;
    END IF;
  ELSE
    UPDATE public.akun_kas SET saldo = saldo - _jumlah WHERE id = _kas;
    IF _hp.supplier_id IS NOT NULL THEN
      UPDATE public.supplier SET saldo_hutang = saldo_hutang - _jumlah WHERE id = _hp.supplier_id;
    END IF;
  END IF;

  INSERT INTO public.audit_log (tenant_id, oleh, aksi, entitas, entitas_id, detail)
    VALUES (_t, auth.uid(), 'pembayaran', 'hutang_piutang', _hutpiut_id, jsonb_build_object('jumlah',_jumlah,'tipe',_hp.tipe));

  RETURN _id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_terima_pembayaran(UUID,NUMERIC,UUID) TO authenticated;

-- ============== RPC: OPNAME ==============
CREATE OR REPLACE FUNCTION public.rpc_opname(_produk_id UUID, _qty_fisik NUMERIC, _alasan TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _t UUID := public.current_tenant(auth.uid());
  _prod RECORD;
  _selisih NUMERIC;
  _id UUID := gen_random_uuid();
BEGIN
  IF _alasan IS NULL OR length(trim(_alasan)) = 0 THEN RAISE EXCEPTION 'Alasan wajib diisi'; END IF;
  SELECT * INTO _prod FROM public.produk WHERE id = _produk_id AND tenant_id = _t FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produk tidak ditemukan'; END IF;
  _selisih := _qty_fisik - _prod.stok;
  UPDATE public.produk SET stok = _qty_fisik WHERE id = _produk_id;
  INSERT INTO public.pergerakan_stok (id, tenant_id, produk_id, tipe, qty, sumber_tipe, alasan, oleh)
    VALUES (_id, _t, _produk_id, 'adj', _selisih, 'opname', _alasan, auth.uid());
  INSERT INTO public.audit_log (tenant_id, oleh, aksi, entitas, entitas_id, detail)
    VALUES (_t, auth.uid(), 'opname', 'produk', _produk_id, jsonb_build_object('selisih',_selisih,'alasan',_alasan));
  RETURN _id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_opname(UUID,NUMERIC,TEXT) TO authenticated;
