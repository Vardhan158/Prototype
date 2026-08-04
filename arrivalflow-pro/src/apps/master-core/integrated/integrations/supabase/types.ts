export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor: string | null;
          changes: Json | null;
          created_at: string;
          entity: string;
          id: string;
          recordCode: string | null;
          recordId: string | null;
        };
        Insert: {
          action: string;
          actor?: string | null;
          changes?: Json | null;
          created_at?: string;
          entity: string;
          id?: string;
          recordCode?: string | null;
          recordId?: string | null;
        };
        Update: {
          action?: string;
          actor?: string | null;
          changes?: Json | null;
          created_at?: string;
          entity?: string;
          id?: string;
          recordCode?: string | null;
          recordId?: string | null;
        };
        Relationships: [];
      };
      carriers: {
        Row: {
          code: string;
          contactPerson: string | null;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          email: string | null;
          hazardTransport: boolean;
          id: string;
          licenseNumber: string | null;
          name: string;
          phone: string | null;
          refrigerated: boolean;
          status: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          contactPerson?: string | null;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          email?: string | null;
          hazardTransport?: boolean;
          id?: string;
          licenseNumber?: string | null;
          name: string;
          phone?: string | null;
          refrigerated?: boolean;
          status?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          contactPerson?: string | null;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          email?: string | null;
          hazardTransport?: boolean;
          id?: string;
          licenseNumber?: string | null;
          name?: string;
          phone?: string | null;
          refrigerated?: boolean;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      countries: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          currency: string | null;
          exchangeRate: number;
          flag: string | null;
          id: string;
          importDuty: string | null;
          language: string | null;
          name: string;
          status: string;
          symbol: string | null;
          taxRule: string | null;
          timeZone: string | null;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          currency?: string | null;
          exchangeRate?: number;
          flag?: string | null;
          id?: string;
          importDuty?: string | null;
          language?: string | null;
          name: string;
          status?: string;
          symbol?: string | null;
          taxRule?: string | null;
          timeZone?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          currency?: string | null;
          exchangeRate?: number;
          flag?: string | null;
          id?: string;
          importDuty?: string | null;
          language?: string | null;
          name?: string;
          status?: string;
          symbol?: string | null;
          taxRule?: string | null;
          timeZone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          billingAddress: string | null;
          category: string | null;
          code: string;
          contactPerson: string | null;
          country: string | null;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          currency: string | null;
          deliveryLocations: number;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          paymentTerms: string | null;
          phone: string | null;
          priority: string;
          shipmentPreference: string | null;
          shippingAddress: string | null;
          status: string;
          taxNumber: string | null;
          updated_at: string;
        };
        Insert: {
          billingAddress?: string | null;
          category?: string | null;
          code: string;
          contactPerson?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          currency?: string | null;
          deliveryLocations?: number;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          paymentTerms?: string | null;
          phone?: string | null;
          priority?: string;
          shipmentPreference?: string | null;
          shippingAddress?: string | null;
          status?: string;
          taxNumber?: string | null;
          updated_at?: string;
        };
        Update: {
          billingAddress?: string | null;
          category?: string | null;
          code?: string;
          contactPerson?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          currency?: string | null;
          deliveryLocations?: number;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          paymentTerms?: string | null;
          phone?: string | null;
          priority?: string;
          shipmentPreference?: string | null;
          shippingAddress?: string | null;
          status?: string;
          taxNumber?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          created_at: string;
          entity: string;
          fileName: string;
          filePath: string;
          fileSize: number;
          id: string;
          mimeType: string | null;
          recordCode: string | null;
          recordId: string | null;
          uploadedBy: string | null;
        };
        Insert: {
          created_at?: string;
          entity: string;
          fileName: string;
          filePath: string;
          fileSize?: number;
          id?: string;
          mimeType?: string | null;
          recordCode?: string | null;
          recordId?: string | null;
          uploadedBy?: string | null;
        };
        Update: {
          created_at?: string;
          entity?: string;
          fileName?: string;
          filePath?: string;
          fileSize?: number;
          id?: string;
          mimeType?: string | null;
          recordCode?: string | null;
          recordId?: string | null;
          uploadedBy?: string | null;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          department: string | null;
          designation: string | null;
          email: string | null;
          id: string;
          joiningDate: string | null;
          manager: string | null;
          name: string;
          phone: string | null;
          role: string | null;
          shift: string | null;
          status: string;
          updated_at: string;
          warehouse: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          department?: string | null;
          designation?: string | null;
          email?: string | null;
          id?: string;
          joiningDate?: string | null;
          manager?: string | null;
          name: string;
          phone?: string | null;
          role?: string | null;
          shift?: string | null;
          status?: string;
          updated_at?: string;
          warehouse?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          department?: string | null;
          designation?: string | null;
          email?: string | null;
          id?: string;
          joiningDate?: string | null;
          manager?: string | null;
          name?: string;
          phone?: string | null;
          role?: string | null;
          shift?: string | null;
          status?: string;
          updated_at?: string;
          warehouse?: string | null;
        };
        Relationships: [];
      };
      items: {
        Row: {
          barcode: string | null;
          brand: string | null;
          category: string;
          code: string;
          cost: number;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          description: string | null;
          dimensions: string | null;
          hazard: string | null;
          hsnCode: string | null;
          id: string;
          manufacturer: string | null;
          maxStock: number;
          minStock: number;
          name: string;
          price: number;
          reorderLevel: number;
          shelfLife: string | null;
          sku: string | null;
          status: string;
          storage: string | null;
          subCategory: string | null;
          unit: string | null;
          updated_at: string;
          weight: string | null;
        };
        Insert: {
          barcode?: string | null;
          brand?: string | null;
          category?: string;
          code: string;
          cost?: number;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          description?: string | null;
          dimensions?: string | null;
          hazard?: string | null;
          hsnCode?: string | null;
          id?: string;
          manufacturer?: string | null;
          maxStock?: number;
          minStock?: number;
          name: string;
          price?: number;
          reorderLevel?: number;
          shelfLife?: string | null;
          sku?: string | null;
          status?: string;
          storage?: string | null;
          subCategory?: string | null;
          unit?: string | null;
          updated_at?: string;
          weight?: string | null;
        };
        Update: {
          barcode?: string | null;
          brand?: string | null;
          category?: string;
          code?: string;
          cost?: number;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          description?: string | null;
          dimensions?: string | null;
          hazard?: string | null;
          hsnCode?: string | null;
          id?: string;
          manufacturer?: string | null;
          maxStock?: number;
          minStock?: number;
          name?: string;
          price?: number;
          reorderLevel?: number;
          shelfLife?: string | null;
          sku?: string | null;
          status?: string;
          storage?: string | null;
          subCategory?: string | null;
          unit?: string | null;
          updated_at?: string;
          weight?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          fullName: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          fullName?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          fullName?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          address: string | null;
          bank: string | null;
          certification: string;
          certificationExpiry: string | null;
          city: string | null;
          code: string;
          commodities: string[];
          contactPerson: string | null;
          country: string | null;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          currency: string | null;
          email: string | null;
          gstNumber: string | null;
          id: string;
          name: string;
          notes: string | null;
          paymentTerms: string | null;
          phone: string | null;
          postalCode: string | null;
          state: string | null;
          status: string;
          taxNumber: string | null;
          type: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          bank?: string | null;
          certification?: string;
          certificationExpiry?: string | null;
          city?: string | null;
          code: string;
          commodities?: string[];
          contactPerson?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          currency?: string | null;
          email?: string | null;
          gstNumber?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          paymentTerms?: string | null;
          phone?: string | null;
          postalCode?: string | null;
          state?: string | null;
          status?: string;
          taxNumber?: string | null;
          type?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          bank?: string | null;
          certification?: string;
          certificationExpiry?: string | null;
          city?: string | null;
          code?: string;
          commodities?: string[];
          contactPerson?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          currency?: string | null;
          email?: string | null;
          gstNumber?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          paymentTerms?: string | null;
          phone?: string | null;
          postalCode?: string | null;
          state?: string | null;
          status?: string;
          taxNumber?: string | null;
          type?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          capacity: string | null;
          carrier: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          driver: string | null;
          fitnessExpiry: string | null;
          gps: string;
          id: string;
          insuranceExpiry: string | null;
          status: string;
          type: string | null;
          updated_at: string;
          vehicleNumber: string;
          volume: string | null;
          weight: string | null;
        };
        Insert: {
          capacity?: string | null;
          carrier?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          driver?: string | null;
          fitnessExpiry?: string | null;
          gps?: string;
          id?: string;
          insuranceExpiry?: string | null;
          status?: string;
          type?: string | null;
          updated_at?: string;
          vehicleNumber: string;
          volume?: string | null;
          weight?: string | null;
        };
        Update: {
          capacity?: string | null;
          carrier?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          driver?: string | null;
          fitnessExpiry?: string | null;
          gps?: string;
          id?: string;
          insuranceExpiry?: string | null;
          status?: string;
          type?: string | null;
          updated_at?: string;
          vehicleNumber?: string;
          volume?: string | null;
          weight?: string | null;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          capacity: number;
          code: string;
          created_at: string;
          created_by: string | null;
          createdAt: string;
          id: string;
          location: string | null;
          manager: string | null;
          name: string;
          status: string;
          updated_at: string;
          utilization: number;
        };
        Insert: {
          capacity?: number;
          code: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          id?: string;
          location?: string | null;
          manager?: string | null;
          name: string;
          status?: string;
          updated_at?: string;
          utilization?: number;
        };
        Update: {
          capacity?: number;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          createdAt?: string;
          id?: string;
          location?: string | null;
          manager?: string | null;
          name?: string;
          status?: string;
          updated_at?: string;
          utilization?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "manager" | "viewer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "viewer"],
    },
  },
} as const;
