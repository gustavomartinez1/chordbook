'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SongEditor from '@/features/canciones/components/SongEditor';
import type { CancionCompleta } from '@/shared/types/supabase';

interface EditarCancionClientProps {
  cancion: CancionCompleta;
  cancionId: string;
  createSeccionAction: (formData: FormData) => Promise<{ id: string } | undefined>;
  deleteLineaAction: (formData: FormData) => Promise<void>;
  createLineaAction: (formData: FormData) => Promise<{ id: string } | undefined>;
  updateLineaAction: (formData: FormData) => Promise<void>;
}

export default function EditarCancionClient({
  cancion,
  cancionId,
  createSeccionAction,
  deleteLineaAction,
  createLineaAction,
  updateLineaAction,
}: EditarCancionClientProps) {
  const router = useRouter();

  const handleAddSeccion = useCallback(
    async (nombre: string) => {
      const formData = new FormData();
      formData.set('cancion_id', cancionId);
      formData.set('nombre', nombre);
      formData.set('orden', String(cancion.secciones.length));
      await createSeccionAction(formData);
      router.refresh();
    },
    [cancionId, cancion.secciones.length, createSeccionAction, router]
  );

  const handleDeleteLinea = useCallback(
    async (id: string) => {
      const formData = new FormData();
      formData.set('id', id);
      await deleteLineaAction(formData);
      router.refresh();
    },
    [deleteLineaAction, router]
  );

  const handleAddLinea = useCallback(
    async (seccionId: string, orden: number) => {
      const formData = new FormData();
      formData.set('seccion_id', seccionId);
      formData.set('orden', String(orden));
      await createLineaAction(formData);
      router.refresh();
    },
    [createLineaAction, router]
  );

  const handleUpdateLinea = useCallback(
    async (
      id: string,
      data: { letra?: string; acordes_raw?: string; orden?: number }
    ) => {
      const formData = new FormData();
      formData.set('id', id);
      if (data.letra !== undefined) formData.set('letra', data.letra);
      if (data.acordes_raw !== undefined)
        formData.set('acordes_raw', data.acordes_raw);
      if (data.orden !== undefined)
        formData.set('orden', String(data.orden));
      await updateLineaAction(formData);
    },
    [updateLineaAction]
  );

  return (
    <SongEditor
      cancion={cancion}
      esAdmin={true}
      onAddSeccion={handleAddSeccion}
      onDeleteLinea={handleDeleteLinea}
      onAddLinea={handleAddLinea}
      onUpdateLinea={handleUpdateLinea}
    />
  );
}
