import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import type { BrandRow } from '@/types/brand';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: brand, error: brandError } = await supabase
      .from('school_brands')
      .select('*')
      .eq('id', id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Явно указываем тип для результата запроса
    const typedBrand = brand as BrandRow;

    // Получаем количество школ
    const { count, error: countError } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', id);

    return NextResponse.json({
      brand: {
        ...typedBrand,
        schools_count: count || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/brands/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, logo_url, banner_url, cover_image_url, short_description, website, founder, description, founded_year, phone, email, telegram, instagram, facebook, youtube } = body;

    const supabase = await createClient();

    // Проверяем существование бренда
    const { data: existing, error: checkError } = await supabase
      .from('school_brands')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Явно указываем тип для результата запроса
    const typedExisting = existing as { id: string; slug: string };

    // Если slug изменился, проверяем уникальность
    if (slug && slug !== typedExisting.slug) {
      const { data: slugExists } = await supabase
        .from('school_brands')
        .select('id')
        .eq('slug', slug)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { error: 'Brand with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Обновляем бренд
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (logo_url !== undefined) updateData.logo_url = logo_url || null;
    if (banner_url !== undefined) updateData.banner_url = banner_url || null;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url || null;
    if (short_description !== undefined) updateData.short_description = short_description || null;
    if (website !== undefined) updateData.website = website || null;
    if (founder !== undefined) updateData.founder = founder || null;
    if (description !== undefined) updateData.description = description || null;
    if (founded_year !== undefined) updateData.founded_year = founded_year || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (telegram !== undefined) updateData.telegram = telegram || null;
    if (instagram !== undefined) updateData.instagram = instagram || null;
    if (facebook !== undefined) updateData.facebook = facebook || null;
    if (youtube !== undefined) updateData.youtube = youtube || null;

    const { data: updatedBrand, error: updateError } = await supabase
      .from('school_brands')
      // @ts-expect-error - Supabase type inference issue with school_brands table
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating brand:', updateError);
      return NextResponse.json(
        { error: 'Failed to update brand: ' + updateError.message },
        { status: 500 }
      );
    }

    // Явно указываем тип для результата запроса
    const typedUpdatedBrand = updatedBrand as BrandRow;

    return NextResponse.json({
      success: true,
      brand: typedUpdatedBrand,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/brands/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    // Проверяем существование бренда
    const { data: existing } = await supabase
      .from('school_brands')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Удаляем бренд (школы останутся без бренда благодаря ON DELETE SET NULL)
    const { error: deleteError } = await supabase
      .from('school_brands')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting brand:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete brand' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/brands/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

