'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 新建笔记相关的状态
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category_id: '', cover_url: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = () => {
    const isLogin = localStorage.getItem('is_my_site_admin');
    setIsAdmin(!!isLogin);
  };

  const fetchData = async () => {
    const { data: cats } = await supabase.from('categories').select('*');
    setCategories(cats || []);
    
    // 获取笔记 (按时间倒序)
    const { data: noteList } = await supabase.from('notes').select('*, categories(name)').order('created_at', { ascending: false });
    setNotes(noteList || []);
  };

  // 创建分类
  const handleAddCategory = async () => {
    const name = prompt("输入新分类名称:");
    if (name) {
      await supabase.from('categories').insert({ name });
      fetchData();
    }
  };

  // 上传笔记封面
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `note-cover-${Date.now()}`;
    await supabase.storage.from('uploads').upload(fileName, file);
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
    setNewNote({ ...newNote, cover_url: data.publicUrl });
    setUploading(false);
  };

  // 提交笔记
  const handleSubmitNote = async () => {
    if (!newNote.title || !newNote.category_id) return alert('标题和分类必填');
    await supabase.from('notes').insert({ ...newNote });
    setIsCreating(false);
    setNewNote({ title: '', content: '', category_id: '', cover_url: '' });
    fetchData();
  };
  
  // 删除笔记
  const handleDelete = async (id, e) => {
    e.preventDefault(); // 防止跳转
    if(confirm('确定删除吗？')) {
        await supabase.from('notes').delete().eq('id', id);
        fetchData();
    }
  };

  // 筛选逻辑
  const filteredNotes = activeCat === 'all' 
    ? notes 
    : notes.filter(n => n.category_id.toString() === activeCat);

  return (
    <div className="space-y-6">
      {/* 顶部标签栏 */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveCat('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${activeCat === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCat(cat.id.toString())}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${activeCat === cat.id.toString() ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            {cat.name}
          </button>
        ))}
        {isAdmin && (
          <button onClick={handleAddCategory} className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200">
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* 新建笔记按钮 (仅管理员) */}
      {isAdmin && !isCreating && (
        <button onClick={() => setIsCreating(true)} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition flex items-center justify-center gap-2">
          <Plus size={20} /> 写一篇新笔记
        </button>
      )}

      {/* 新建笔记面板 */}
      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 animate-fade-in-down">
          <h3 className="font-bold text-lg">新建笔记</h3>
          <div className="grid grid-cols-2 gap-4">
             <input 
                type="text" placeholder="标题" 
                className="border p-2 rounded w-full"
                value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})}
             />
             <select 
                className="border p-2 rounded w-full"
                value={newNote.category_id} onChange={e => setNewNote({...newNote, category_id: e.target.value})}
             >
                <option value="">选择分类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          
          {/* 简易封面上传 */}
          <div className="flex items-center gap-4">
            {newNote.cover_url && <img src={newNote.cover_url} className="w-16 h-16 object-cover rounded" />}
            <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded text-sm hover:bg-gray-200">
                {uploading ? '上传中' : '上传封面图'}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          </div>

          <textarea 
            placeholder="正文内容..." 
            className="border p-2 rounded w-full h-32"
            value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500">取消</button>
            <button onClick={handleSubmitNote} className="px-4 py-2 bg-indigo-600 text-white rounded">发布</button>
          </div>
        </div>
      )}

      {/* 瀑布流展示 (小红书风格: Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredNotes.map(note => (
          <Link key={note.id} href={`/notes/${note.id}`} className="group block bg-white rounded-xl overflow-hidden border hover:shadow-lg transition">
            {/* 封面图区域 */}
            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                {note.cover_url ? (
                    <img src={note.cover_url} alt={note.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={40} />
                    </div>
                )}
            </div>
            {/* 标题与日期 */}
            <div className="p-3">
                <h3 className="font-bold text-gray-800 line-clamp-2 text-sm mb-2 group-hover:text-indigo-600 transition">{note.title}</h3>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{format(new Date(note.created_at), 'MM-dd')}</span>
                    {isAdmin && (
                        <button onClick={(e) => handleDelete(note.id, e)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                    )}
                </div>
            </div>
          </Link>
        ))}
      </div>
      {filteredNotes.length === 0 && <p className="text-center text-gray-400 mt-10">这里还是一片荒原...</p>}
    </div>
  );
}