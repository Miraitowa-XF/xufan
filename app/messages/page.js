'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Settings, Lock, Trash2, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function MessageTree() {
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [userAnswer, setUserAnswer] = useState('');
  const [question, setQuestion] = useState('加载中...');
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
    if (isAdmin) {
        await postMessage();
    } else {
        setShowModal(true);
    }
  };

  const handleVerifyAndSend = async () => {
    if (userAnswer.trim() === realAnswer.trim()) {
        await postMessage();
        setShowModal(false);
        setUserAnswer('');
    } else {
        alert('答案不对哦~ 再想想？');
    }
  };

  // --- ✨ 核心修改 1：生成随机昵称的工具函数 ---
  const getRandomNickname = () => {
    const adjectives = [
        '迷路的', '发呆的', '快乐的', '犯困的', '优雅的', 
        '神秘的', '路过的', '贪吃的', '举着荷叶的', '晒太阳的',
        '说悄悄话的', '喜欢下雨的', '正在做梦的', '想要飞的', 
        '发光的', '温柔的', '勇敢的', '慢吞吞的',

        // ✨ 新增：情绪与状态
        '刚睡醒的', '气呼呼的', '软绵绵的', '正在充电的', '戴墨镜的',
        '喝汽水的', '社恐的', '不想长大的', 'emo的', '开心的',
        '毛茸茸的', '吃不饱的', '拥有超能力的', '古灵精怪的', '发芽的',
        
        // ✨ 新增：诗意与动作
        '追逐晚风的', '收集月光的', '练习魔法的', '数星星的', 
        '贩卖黄昏的', '等公交的', '写诗的', '环游世界的', '发条没拧紧的'
    ];
    const nouns = [
        '小鹿', '蘑菇', '树懒', '猫头鹰', '小松鼠', 
        '萤火虫', '蜗牛', '小刺猬', '龙猫', '小精灵',
        '风信子', '橡实', '云朵', '月亮',
        '星星', '极光', '旅行者',

        // ✨ 新增：可爱的动物
        '水豚', '考拉', '小熊猫', '哈士奇', '北极熊', 
        '长颈鹿', '企鹅', '海獭', '小脑斧', '独角兽',
        
        // ✨ 新增：职业与幻想
        '宇航员', '潜水员', '机器人', '吟游诗人', '魔法师', 
        '小怪兽', '信使', '观察员', '探险家', '艺术家',
        
        // ✨ 新增：静物与食物
        '甜甜圈', '荷包蛋', '仙人掌', '不倒翁', '收音机',
        '星球', '气泡水', '棉花糖'
    ];
    // 完全随机选择，不再依赖 ID
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return adj + noun;
  };

  // --- ✨ 核心修改 2：发布时存入数据库 ---
  const postMessage = async () => {
    // 1. 生成一个永久昵称
    const finalNickname = getRandomNickname();

    // 2. 存入数据库
    const { error } = await supabase.from('messages').insert({ 
        content: inputContent,
        nickname: finalNickname // 存进去！
    });

    if (error) {
        alert('发布失败，请稍后再试');
    } else {
        setInputContent('');
        fetchMessages();
    }
  };

  // --- ✨ 核心修改 3：老数据兼容算法 ---
  // 如果数据库里 nickname 是空的（老数据），用这个旧算法算出来，保证显示正常
  const generateLegacyNickname = (id) => {
    const adjectives = ['迷路的', '发呆的', '快乐的', '犯困的', '优雅的', '神秘的', '路过的', '贪吃的', '举着荷叶的', '晒太阳的'];
    const nouns = ['小鹿', '蘑菇', '树懒', '猫头鹰', '小松鼠', '萤火虫', '蜗牛', '小刺猬', '龙猫', '小精灵'];
    const adjIndex = id % adjectives.length;
    const nounIndex = (id + 3) % nouns.length;
    return adjectives[adjIndex] + nouns[nounIndex];
  };

  const handleUpdateSettings = async () => {
    await supabase.from('site_config').upsert({ key: 'security_question', value: newQ });
    await supabase.from('site_config').upsert({ key: 'security_answer', value: newA });
    setQuestion(newQ);
    setRealAnswer(newA);
    setShowSettings(false);
    alert('门禁问题已更新');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('确定要把这条留言删掉吗？')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) {
        alert('删除失败：' + error.message);
    } else {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* 顶部输入区 */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-10">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">留言树洞</h2>
                <p className="text-slate-400 text-sm mt-1">在这里，哪怕是碎碎念也会被倾听</p>
            </div>
            {isAdmin && (
                <button onClick={()=>setShowSettings(!showSettings)} className="text-slate-300 hover:text-indigo-600 p-2 bg-slate-50 rounded-full transition">
                    <Settings size={20}/>
                </button>
            )}
        </div>
        
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

        <div className="relative group">
            <textarea 
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                placeholder="写下你想说的话..."
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

      {/* 留言列表 */}
      <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
        {messages.map(msg => (
            <div key={msg.id} className="break-inside-avoid bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition duration-300 group relative">
                <div className="text-slate-600 text-sm leading-7 font-medium whitespace-pre-wrap break-words min-h-[40px]">
                    {msg.content}
                </div>
                
                <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                        <div className="bg-indigo-50 p-1 rounded-full text-indigo-400">
                            <User size={10} />
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                            {/* ✨ 核心修改 4：优先显示数据库里的 nickname，没有则回退到旧算法 */}
                            {msg.nickname || generateLegacyNickname(msg.id)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300 self-end">
                        <Clock size={10} />
                        <span className="text-[10px] font-mono tabular-nums tracking-tight">
                            {format(new Date(msg.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                    </div>
                </div>

                {isAdmin && (
                    <button 
                        onClick={(e) => handleDelete(msg.id, e)}
                        className="absolute top-2 right-2 p-2 bg-white/90 text-slate-300 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm border border-slate-100"
                        title="删除"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        ))}
      </div>

      {/* 弹窗代码保持不变... */}
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