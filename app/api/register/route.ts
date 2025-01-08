import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      departmentName,
      lastName,
      firstName,
      email,
      phoneNumber,
      password,
    } = body;

    const supabase = createRouteHandlerClient({ cookies });

    // Supabaseで認証を行う
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          department_name: departmentName,
          full_name: `${lastName} ${firstName}`,
          phone_number: phoneNumber,
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // profilesテーブルにユーザー情報を登録
    if (authData.user) {
      const profileData = {
        id: authData.user.id,
        username: email,
        full_name: `${lastName} ${firstName}`,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        company_name: companyName,
        department: departmentName,
        plan: 'free'
      };

      console.log('Inserting profile data:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        console.error('Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        return NextResponse.json(
          { error: 'ユーザープロフィールの作成に失敗しました', details: profileError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(authData, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '会員登録に失敗しました', details: error },
      { status: 500 }
    );
  }
} 