export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      akun_kas: {
        Row: {
          created_at: string
          id: string
          nama: string
          saldo: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          saldo?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          saldo?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "akun_kas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          aksi: string
          created_at: string
          detail: Json | null
          entitas: string | null
          entitas_id: string | null
          id: string
          oleh: string | null
          tenant_id: string
        }
        Insert: {
          aksi: string
          created_at?: string
          detail?: Json | null
          entitas?: string | null
          entitas_id?: string | null
          id?: string
          oleh?: string | null
          tenant_id: string
        }
        Update: {
          aksi?: string
          created_at?: string
          detail?: Json | null
          entitas?: string | null
          entitas_id?: string | null
          id?: string
          oleh?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      detail_transaksi: {
        Row: {
          harga: number
          hpp: number
          id: string
          pembelian_id: string | null
          penjualan_id: string | null
          produk_id: string
          qty: number
          tenant_id: string
        }
        Insert: {
          harga: number
          hpp?: number
          id?: string
          pembelian_id?: string | null
          penjualan_id?: string | null
          produk_id: string
          qty: number
          tenant_id: string
        }
        Update: {
          harga?: number
          hpp?: number
          id?: string
          pembelian_id?: string | null
          penjualan_id?: string | null
          produk_id?: string
          qty?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detail_transaksi_pembelian_id_fkey"
            columns: ["pembelian_id"]
            isOneToOne: false
            referencedRelation: "pembelian"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detail_transaksi_penjualan_id_fkey"
            columns: ["penjualan_id"]
            isOneToOne: false
            referencedRelation: "penjualan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detail_transaksi_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detail_transaksi_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hutang_piutang: {
        Row: {
          created_at: string
          id: string
          jatuh_tempo: string
          pelanggan_id: string | null
          pembelian_id: string | null
          penjualan_id: string | null
          sisa: number
          status: Database["public"]["Enums"]["status_hutpiut"]
          supplier_id: string | null
          tenant_id: string
          tipe: Database["public"]["Enums"]["tipe_hutpiut"]
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          jatuh_tempo: string
          pelanggan_id?: string | null
          pembelian_id?: string | null
          penjualan_id?: string | null
          sisa: number
          status?: Database["public"]["Enums"]["status_hutpiut"]
          supplier_id?: string | null
          tenant_id: string
          tipe: Database["public"]["Enums"]["tipe_hutpiut"]
          total: number
        }
        Update: {
          created_at?: string
          id?: string
          jatuh_tempo?: string
          pelanggan_id?: string | null
          pembelian_id?: string | null
          penjualan_id?: string | null
          sisa?: number
          status?: Database["public"]["Enums"]["status_hutpiut"]
          supplier_id?: string | null
          tenant_id?: string
          tipe?: Database["public"]["Enums"]["tipe_hutpiut"]
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "hutang_piutang_pelanggan_id_fkey"
            columns: ["pelanggan_id"]
            isOneToOne: false
            referencedRelation: "pelanggan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hutang_piutang_pembelian_id_fkey"
            columns: ["pembelian_id"]
            isOneToOne: false
            referencedRelation: "pembelian"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hutang_piutang_penjualan_id_fkey"
            columns: ["penjualan_id"]
            isOneToOne: false
            referencedRelation: "penjualan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hutang_piutang_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hutang_piutang_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kategori: {
        Row: {
          created_at: string
          id: string
          nama: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kategori_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pelanggan: {
        Row: {
          created_at: string
          id: string
          kontak: string | null
          nama: string
          saldo_piutang: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kontak?: string | null
          nama: string
          saldo_piutang?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kontak?: string | null
          nama?: string
          saldo_piutang?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pelanggan_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pembayaran: {
        Row: {
          akun_kas_id: string | null
          hutpiut_id: string
          id: string
          jumlah: number
          oleh: string | null
          tanggal: string
          tenant_id: string
        }
        Insert: {
          akun_kas_id?: string | null
          hutpiut_id: string
          id?: string
          jumlah: number
          oleh?: string | null
          tanggal?: string
          tenant_id: string
        }
        Update: {
          akun_kas_id?: string | null
          hutpiut_id?: string
          id?: string
          jumlah?: number
          oleh?: string | null
          tanggal?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pembayaran_akun_kas_id_fkey"
            columns: ["akun_kas_id"]
            isOneToOne: false
            referencedRelation: "akun_kas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembayaran_hutpiut_id_fkey"
            columns: ["hutpiut_id"]
            isOneToOne: false
            referencedRelation: "hutang_piutang"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembayaran_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pembelian: {
        Row: {
          akun_kas_id: string | null
          created_at: string
          dibuat_oleh: string | null
          id: string
          jatuh_tempo: string | null
          jenis_bayar: Database["public"]["Enums"]["jenis_bayar"]
          nomor: string
          status: Database["public"]["Enums"]["status_pembelian"]
          supplier_id: string | null
          tanggal: string
          tenant_id: string
          total: number
        }
        Insert: {
          akun_kas_id?: string | null
          created_at?: string
          dibuat_oleh?: string | null
          id?: string
          jatuh_tempo?: string | null
          jenis_bayar: Database["public"]["Enums"]["jenis_bayar"]
          nomor: string
          status?: Database["public"]["Enums"]["status_pembelian"]
          supplier_id?: string | null
          tanggal?: string
          tenant_id: string
          total?: number
        }
        Update: {
          akun_kas_id?: string | null
          created_at?: string
          dibuat_oleh?: string | null
          id?: string
          jatuh_tempo?: string | null
          jenis_bayar?: Database["public"]["Enums"]["jenis_bayar"]
          nomor?: string
          status?: Database["public"]["Enums"]["status_pembelian"]
          supplier_id?: string | null
          tanggal?: string
          tenant_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pembelian_akun_kas_id_fkey"
            columns: ["akun_kas_id"]
            isOneToOne: false
            referencedRelation: "akun_kas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembelian_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembelian_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      penjualan: {
        Row: {
          akun_kas_id: string | null
          catatan: string | null
          created_at: string
          hpp_total: number
          id: string
          jatuh_tempo: string | null
          jenis_bayar: Database["public"]["Enums"]["jenis_bayar"]
          kasir_id: string | null
          nomor: string
          pelanggan_id: string | null
          tanggal: string
          tenant_id: string
          total: number
        }
        Insert: {
          akun_kas_id?: string | null
          catatan?: string | null
          created_at?: string
          hpp_total?: number
          id?: string
          jatuh_tempo?: string | null
          jenis_bayar: Database["public"]["Enums"]["jenis_bayar"]
          kasir_id?: string | null
          nomor: string
          pelanggan_id?: string | null
          tanggal?: string
          tenant_id: string
          total?: number
        }
        Update: {
          akun_kas_id?: string | null
          catatan?: string | null
          created_at?: string
          hpp_total?: number
          id?: string
          jatuh_tempo?: string | null
          jenis_bayar?: Database["public"]["Enums"]["jenis_bayar"]
          kasir_id?: string | null
          nomor?: string
          pelanggan_id?: string | null
          tanggal?: string
          tenant_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "penjualan_akun_kas_id_fkey"
            columns: ["akun_kas_id"]
            isOneToOne: false
            referencedRelation: "akun_kas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penjualan_pelanggan_id_fkey"
            columns: ["pelanggan_id"]
            isOneToOne: false
            referencedRelation: "pelanggan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penjualan_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pergerakan_stok: {
        Row: {
          alasan: string | null
          id: string
          oleh: string | null
          produk_id: string
          qty: number
          sumber_id: string | null
          sumber_tipe: string | null
          tanggal: string
          tenant_id: string
          tipe: Database["public"]["Enums"]["tipe_gerakan"]
        }
        Insert: {
          alasan?: string | null
          id?: string
          oleh?: string | null
          produk_id: string
          qty: number
          sumber_id?: string | null
          sumber_tipe?: string | null
          tanggal?: string
          tenant_id: string
          tipe: Database["public"]["Enums"]["tipe_gerakan"]
        }
        Update: {
          alasan?: string | null
          id?: string
          oleh?: string | null
          produk_id?: string
          qty?: number
          sumber_id?: string | null
          sumber_tipe?: string | null
          tanggal?: string
          tenant_id?: string
          tipe?: Database["public"]["Enums"]["tipe_gerakan"]
        }
        Relationships: [
          {
            foreignKeyName: "pergerakan_stok_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pergerakan_stok_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      produk: {
        Row: {
          created_at: string
          harga_beli: number
          harga_jual: number
          id: string
          kategori_id: string | null
          nama: string
          satuan: string
          sku: string
          stok: number
          stok_min: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          harga_beli?: number
          harga_jual?: number
          id?: string
          kategori_id?: string | null
          nama: string
          satuan?: string
          sku: string
          stok?: number
          stok_min?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          harga_beli?: number
          harga_jual?: number
          id?: string
          kategori_id?: string | null
          nama?: string
          satuan?: string
          sku?: string
          stok?: number
          stok_min?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produk_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produk_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nama: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nama: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nama?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier: {
        Row: {
          created_at: string
          id: string
          kontak: string | null
          nama: string
          saldo_hutang: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kontak?: string | null
          nama: string
          saldo_hutang?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kontak?: string | null
          nama?: string
          saldo_hutang?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          nama_usaha: string
          paket: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama_usaha: string
          paket?: string
        }
        Update: {
          created_at?: string
          id?: string
          nama_usaha?: string
          paket?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_tenant: { Args: { _uid: string }; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _uid: string }
        Returns: boolean
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      rpc_buat_pembelian: {
        Args: {
          _akun_kas_id?: string
          _items: Json
          _jatuh_tempo?: string
          _jenis_bayar: Database["public"]["Enums"]["jenis_bayar"]
          _supplier_id: string
        }
        Returns: string
      }
      rpc_buat_penjualan: {
        Args: {
          _akun_kas_id?: string
          _catatan?: string
          _items: Json
          _jatuh_tempo?: string
          _jenis_bayar: Database["public"]["Enums"]["jenis_bayar"]
          _pelanggan_id?: string
        }
        Returns: string
      }
      rpc_opname: {
        Args: { _alasan: string; _produk_id: string; _qty_fisik: number }
        Returns: string
      }
      rpc_terima_pembayaran: {
        Args: { _akun_kas_id?: string; _hutpiut_id: string; _jumlah: number }
        Returns: string
      }
    }
    Enums: {
      app_role: "pemilik" | "kasir" | "gudang" | "keuangan"
      jenis_bayar: "tunai" | "kredit"
      status_hutpiut: "BELUM" | "SEBAGIAN" | "LUNAS"
      status_pembelian: "draft" | "dikirim" | "diterima" | "batal"
      tipe_gerakan: "in" | "out" | "adj"
      tipe_hutpiut: "hutang" | "piutang"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["pemilik", "kasir", "gudang", "keuangan"],
      jenis_bayar: ["tunai", "kredit"],
      status_hutpiut: ["BELUM", "SEBAGIAN", "LUNAS"],
      status_pembelian: ["draft", "dikirim", "diterima", "batal"],
      tipe_gerakan: ["in", "out", "adj"],
      tipe_hutpiut: ["hutang", "piutang"],
    },
  },
} as const
