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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asistencia: {
        Row: {
          created_at: string | null
          id: string
          nino_id: string
          presente: boolean | null
          sesion_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nino_id: string
          presente?: boolean | null
          sesion_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nino_id?: string
          presente?: boolean | null
          sesion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_nino_id_fkey"
            columns: ["nino_id"]
            isOneToOne: false
            referencedRelation: "ninos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones"
            referencedColumns: ["id"]
          },
        ]
      }
      cb_canciones: {
        Row: {
          artista: string | null
          compas: string | null
          created_at: string | null
          created_by: string
          id: string
          notas: string | null
          tempo: number | null
          titulo: string
          tono_original: string
          updated_at: string | null
        }
        Insert: {
          artista?: string | null
          compas?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          notas?: string | null
          tempo?: number | null
          titulo: string
          tono_original?: string
          updated_at?: string | null
        }
        Update: {
          artista?: string | null
          compas?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          notas?: string | null
          tempo?: number | null
          titulo?: string
          tono_original?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cb_lineas: {
        Row: {
          acordes_raw: string | null
          id: string
          letra: string | null
          orden: number
          seccion_id: string
        }
        Insert: {
          acordes_raw?: string | null
          id?: string
          letra?: string | null
          orden?: number
          seccion_id: string
        }
        Update: {
          acordes_raw?: string | null
          id?: string
          letra?: string | null
          orden?: number
          seccion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cb_lineas_seccion_id_fkey"
            columns: ["seccion_id"]
            isOneToOne: false
            referencedRelation: "cb_secciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cb_roles: {
        Row: {
          created_at: string | null
          id: string
          rol: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rol: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rol?: string
          user_id?: string
        }
        Relationships: []
      }
      cb_secciones: {
        Row: {
          cancion_id: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          cancion_id: string
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          cancion_id?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "cb_secciones_cancion_id_fkey"
            columns: ["cancion_id"]
            isOneToOne: false
            referencedRelation: "cb_canciones"
            referencedColumns: ["id"]
          },
        ]
      }
      maestros: {
        Row: {
          activo: boolean
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      ninos: {
        Row: {
          created_at: string | null
          edad: number
          genero: string
          id: string
          necesidades_especiales: boolean
          nombre_completo: string
          notas: string | null
          numero_tutor: string
          salon_id: string
          salon_manual: boolean
          telefono_papa: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          edad: number
          genero?: string
          id?: string
          necesidades_especiales?: boolean
          nombre_completo: string
          notas?: string | null
          numero_tutor: string
          salon_id: string
          salon_manual?: boolean
          telefono_papa?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          edad?: number
          genero?: string
          id?: string
          necesidades_especiales?: boolean
          nombre_completo?: string
          notas?: string | null
          numero_tutor?: string
          salon_id?: string
          salon_manual?: boolean
          telefono_papa?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      puntos: {
        Row: {
          alabanza: number
          asistencia: number
          conducta: number
          id: string
          nino_id: string
          ofrenda: number
          participacion: number
          tarea: number
          updated_at: string | null
          versiculo: number
        }
        Insert: {
          alabanza?: number
          asistencia?: number
          conducta?: number
          id?: string
          nino_id: string
          ofrenda?: number
          participacion?: number
          tarea?: number
          updated_at?: string | null
          versiculo?: number
        }
        Update: {
          alabanza?: number
          asistencia?: number
          conducta?: number
          id?: string
          nino_id?: string
          ofrenda?: number
          participacion?: number
          tarea?: number
          updated_at?: string | null
          versiculo?: number
        }
        Relationships: [
          {
            foreignKeyName: "puntos_nino_id_fkey"
            columns: ["nino_id"]
            isOneToOne: false
            referencedRelation: "ninos"
            referencedColumns: ["id"]
          },
        ]
      }
      puntos_log: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          nino_id: string
          sesion_id: string
          tipo: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: string
          nino_id: string
          sesion_id: string
          tipo?: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          nino_id?: string
          sesion_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "puntos_log_nino_id_fkey"
            columns: ["nino_id"]
            isOneToOne: false
            referencedRelation: "ninos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puntos_log_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp_responses: {
        Row: {
          asistentes: number
          confirmado: boolean | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          restriccion_alimentaria: string | null
        }
        Insert: {
          asistentes?: number
          confirmado?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          restriccion_alimentaria?: string | null
        }
        Update: {
          asistentes?: number
          confirmado?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          restriccion_alimentaria?: string | null
        }
        Relationships: []
      }
      sesiones: {
        Row: {
          created_at: string | null
          estado: string
          fecha: string
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          maestro_nombre: string
          salon_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          maestro_nombre: string
          salon_id: string
        }
        Update: {
          created_at?: string | null
          estado?: string
          fecha?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          maestro_nombre?: string
          salon_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      requesting_user_id: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Tipos compuestos para CHORDBOOK
export type CancionRow = Database['public']['Tables']['cb_canciones']['Row'];
export type SeccionRow = Database['public']['Tables']['cb_secciones']['Row'];
export type LineaRow = Database['public']['Tables']['cb_lineas']['Row'];

export type SeccionConLineas = SeccionRow & {
  lineas: LineaRow[];
};

export type CancionCompleta = CancionRow & {
  secciones: SeccionConLineas[];
};
