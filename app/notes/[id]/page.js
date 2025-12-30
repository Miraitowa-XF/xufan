'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function NoteDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
        const { data } = await supabase.from('notes').select('*, categories(name)').eq('id', id).single();
        setNote(data);
    };
    if (id) fetchNote();
  }, [id]);

  if (!note) return <div className="p-10 text-center">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-sm rounded-xl p-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft size={18} /> 返回
      </button>
      
      {note.cover_url && (
        <img src={note.cover_url} alt={note.title} className="w-full h-64 object-cover rounded-xl mb-8" />
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{note.categories?.name}</span>
        <span className="text-gray-400 text-sm">{format(new Date(note.created_at), 'yyyy年MM月dd日 HH:mm')}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{note.title}</h1>
      
      {/* 渲染正文，支持换行 */}
      <div className="prose prose-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
        {note.content}
      </div>
    </div>
  );
}