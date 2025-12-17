import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    
    // Получаем школу по slug
    const { data: school, error: schoolError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .eq('org_type', 'school')
      .single();
    
    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }
    
    // Получаем педагогический состав
    const { data: staff, error } = await supabase
      .from('school_staff')
      .select('*')
      .eq('organization_id', school.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching staff:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      );
    }
    
    // Форматируем данные
    const formattedStaff = staff?.map((s) => ({
      id: s.id,
      name: s.name,
      position: s.position,
      photoUrl: s.photo_url || undefined,
      experienceYears: s.experience_years || undefined,
      education: s.education || undefined,
      certifications: s.certifications || [],
      bio: s.bio || undefined,
    })) || [];
    
    // Разделяем на руководство и учителей
    const leadership = formattedStaff.filter(
      (s) =>
        s.position === 'director' ||
        s.position === 'deputy_director' ||
        s.position === 'head_teacher'
    );
    
    const teachers = formattedStaff.filter(
      (s) => s.position === 'teacher' || !leadership.includes(s)
    );
    
    return NextResponse.json({
      leadership,
      teachers,
      total: formattedStaff.length,
    });
  } catch (error) {
    console.error('Error in staff API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

