
REVOKE EXECUTE ON FUNCTION public.current_tenant(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_buat_penjualan(JSONB,jenis_bayar,UUID,DATE,UUID,TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_buat_pembelian(JSONB,UUID,jenis_bayar,DATE,UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_terima_pembayaran(UUID,NUMERIC,UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_opname(UUID,NUMERIC,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
