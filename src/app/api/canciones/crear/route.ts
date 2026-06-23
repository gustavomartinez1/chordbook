import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const titulo = formData.get('titulo') as string;
    const artista = (formData.get('artista') as string) || '';
    const tono_original = formData.get('tono_original') as string;
    const tempo = formData.get('tempo') ? parseInt(formData.get('tempo') as string) : null;
    const compas = (formData.get('compas') as string) || '4/4';
    const admin_pin = formData.get('admin_pin') as string;
    const letra = (formData.get('letra') as string) || '';
    const acordes_raw = (formData.get('acordes_raw') as string) || '';

    // Verificar PIN
    const expectedPin = process.env.ADMIN_PIN ?? '1234';
    if (admin_pin !== expectedPin) {
      return NextResponse.json({ error: 'PIN de administrador incorrecto' }, { status: 401 });
    }

    // Validar título
    if (!titulo || titulo.trim().length === 0) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const supabase = await createClient();

    // Crear canción
    const { data: cancion, error: errCancion } = await supabase
      .from('cb_canciones')
      .insert({
        titulo: titulo.trim(),
        artista: artista || null,
        tono_original: tono_original || 'C',
        tempo,
        compas,
        created_by: 'cd7a7d21-b8a8-4688-a6b5-e860ca17109f',
      })
      .select('id')
      .single();

    if (errCancion) {
      return NextResponse.json({ error: 'Error al crear canción: ' + errCancion.message }, { status: 500 });
    }

    // Si hay letra, crear sección y línea
    if (letra.trim() && cancion) {
      const { data: seccion, error: errSeccion } = await supabase
        .from('cb_secciones')
        .insert({ cancion_id: cancion.id, nombre: 'Verso', orden: 0 })
        .select('id')
        .single();

      if (!errSeccion && seccion) {
        await supabase.from('cb_lineas').insert({
          seccion_id: seccion.id,
          orden: 0,
          letra: letra.trim(),
          acordes_raw: acordes_raw || '',
        });
      }
    }

    return NextResponse.json({ redirect: `/canciones/${cancion.id}/editar` });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno: ' + String(err) }, { status: 500 });
  }
}
