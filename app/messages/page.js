'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Settings, Lock } from 'lucide-react';

export default function MessageTree() {
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [userAnswer, setUserAnswer] = useState('');
  const [question, setQuestion] = useState('Wait loading...');
  const [realAnswer, setRealAnswer] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  useEffect(() => {
    const isLogin = localStorage.getItem('is_my_site_admin');
    setIsAdmin(!!isLogin);
    fetchMessages();
    fetchSecurityConfig();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
  };

  const fetchSecurityConfig = async () => {
    const { data: qData } = await supabase.from('site_config').select('value').eq('key', 'security_question').single();
    const { data: aData } = await supabase.from('site_config').select('value').eq('key', 'security_answer').single();
    if (qData) { setQuestion(qData.value); setNewQ(qData.value); }
    if (aData) { setRealAnswer(aData.value); setNewA(aData.value); }
  };

  const handlePreSubmit = async () => {
    if (!inputContent.trim()) return;
    if (isAdmin) await postMessage();
    else setShowModal(true);
  };

  const handleVerifyAndSend = async () => {
    if (userAnswer.trim() === realAnswer.trim()) {
        await postMessage();
        setShowModal(false);
        setUserAnswer('');
    } else {
        alert('答案不对哦~');
    }
  };

  const postMessage = async () => {
    await supabase.from('messages').insert({ content: inputContent });
    setInputContent('');
    fetchMessages();
  };

  const handleUpdateSettings = async () => {
    await supabase.from('site_config').upsert({ key: 'security_question', value: newQ });
    await supabase.from('site_config').upsert({ key: 'security_answer', value: newA });
    setQuestion(newQ);
    setRealAnswer(newA);
    setShowSettings(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* 顶部输入区 */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-10">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">留言树洞</h2>
                <p className="text-slate-400 text-sm mt-1">留下一句温暖的话吧</p>
            </div>
            {isAdmin && (
                <button onClick={()=>setShowSettings(!showSettings)} className="text-slate-300 hover:text-indigo-600 p-2 bg-slate-50 rounded-full transition">
                    <Settings size={20}/>
                </button>
            )}
        </div>
        
        {/* 设置面板 */}
        {showSettings && (
            <div className="bg-slate-50 p-6 mb-6 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Lock size={16}/> 门禁设置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={newQ} onChange={e=>setNewQ(e.target.value)} className="border-none bg-white p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-100 text-sm" placeholder="设置问题"/>
                    <input value={newA} onChange={e=>setNewA(e.target.value)} className="border-none bg-white p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-100 text-sm" placeholder="设置答案"/>
                </div>
                <button onClick={handleUpdateSettings} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition">保存设置</button>
            </div>
        )}

        {/* 输入框 */}
        <div className="relative group">
            <textarea 
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                placeholder="在这里写下你的留言..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none h-32 resize-none text-slate-600 leading-relaxed"
            />
            <div className="absolute bottom-4 right-4">
                <button 
                    onClick={handlePreSubmit}
                    className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg shadow-indigo-200 hover:scale-110 hover:shadow-indigo-300 transition active:scale-95"
                >
                    <Send size={18} className="-ml-0.5 mt-0.5" />
                </button>
            </div>
        </div>
      </div>

      {/* 留言列表 (Masonry Grid style visually) */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {messages.map(msg => (
            <div key={msg.id} className="break-inside-avoid bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition duration-300 group cursor-pointer">
                <div className="text-slate-600 text-sm leading-7 font-medium">
                    {msg.content}
                </div>
                <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-50">
                    <div className="text-[10px] text-slate-300 font-mono bg-slate-50 px-2 py-1 rounded-md">
                        #{msg.id}
                    </div>
                    <div className="text-[10px] text-slate-300">
                        {new Date(msg.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* 验证弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl w-96 shadow-2xl animate-in zoom-in duration-200">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Lock size={24} />
                </div>
                <h3 className="font-bold text-xl text-center text-slate-800 mb-2">暗号验证</h3>
                <p className="text-sm text-slate-500 text-center mb-6 bg-slate-50 p-3 rounded-xl">{question}</p>
                <input 
                    type="text" 
                    placeholder="输入答案..."
                    className="w-full bg-slate-50 border-none p-4 rounded-xl mb-6 text-center focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-700"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                />
                <div className="flex gap-3">
                    <button onClick={()=>setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition">取消</button>
                    <button onClick={handleVerifyAndSend} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition">确认发布</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}