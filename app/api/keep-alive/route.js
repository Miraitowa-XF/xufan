// app/api/keep-alive/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// 关键配置：强制该 API 不使用缓存，每次请求都真实运行代码
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 执行一个非常轻量级的查询，只需获取 site_config 表的一行数据即可
    // 这足以告诉 Supabase：数据库正在被使用，不要休眠
    const { data, error } = await supabase
      .from('site_config')
      .select('key')
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase ping error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database waked up successfully!',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}