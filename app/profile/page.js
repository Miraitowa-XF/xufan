'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageCropper from '@/app/components/ImageCropper';
import {
  Camera, Plus, Trash2, Pencil, Save, X, Code2, FolderGit2,
  Heart, Info, Image as ImageIcon, IndentIncrease, IndentDecrease, Mail
} from 'lucide-react';

/* ---------- 默认配置 ---------- */
const DEFAULT_CONFIG = {
  greeting: '你好，我是舤',
  bio: '一个热爱代码与生活的探索者，喜欢把奇思妙想变成真实存在的小东西',
  about: [
    { id: 'a1', label: '职业', value: '全栈开发者', indent: 0, size: 'base' },
    { id: 'a2', label: '所在地', value: '中国 · 地球', indent: 0, size: 'base' },
    { id: 'a3', label: '状态', value: '正在探索世界', indent: 0, size: 'base' },
  ],
  techStack: [
    { id: 't1', name: 'JavaScript' },
    { id: 't2', name: 'TypeScript' },
    { id: 't3', name: 'React' },
    { id: 't4', name: 'Next.js' },
    { id: 't5', name: 'Node.js' },
    { id: 't6', name: 'Python' },
    { id: 't7', name: 'TailwindCSS' },
    { id: 't8', name: 'Supabase' },
  ],
  projects: [
    {
      id: 'p1',
      title: '个人数据库',
      description: '一个集主页、笔记、树洞于一体的个人空间，记录生活与技术的点滴。',
      image: '',
      techs: ['Next.js', 'Supabase', 'TailwindCSS'],
      span: 1,
    },
  ],
  interests: [
    { id: 'i1', category: '游戏', items: ['塞尔达传说', '原神', '星露谷物语'] },
    { id: 'i2', category: '音乐', items: ['周杰伦', '林俊杰', '久石让'] },
    { id: 'i3', category: '生活', items: ['摄影', '骑行', '看日落'] },
  ],
  contacts: [
    { id: 'c1', platform: 'GitHub', account: 'yourname', link: 'https://github.com/yourname', icon: '' },
    { id: 'c2', platform: 'Email', account: 'you@example.com', link: 'mailto:you@example.com', icon: '' },
  ],
};

const SIZE_OPTIONS = [
  { key: 'sm', label: '小', className: 'text-sm' },
  { key: 'base', label: '中', className: 'text-base' },
  { key: 'lg', label: '大', className: 'text-lg' },
  { key: 'xl', label: '特大', className: 'text-xl' },
];

const TAG_COLORS = [
  'bg-indigo-50 text-indigo-600 border-indigo-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-pink-50 text-pink-600 border-pink-100',
  'bg-sky-50 text-sky-600 border-sky-100',
  'bg-violet-50 text-violet-600 border-violet-100',
  'bg-rose-50 text-rose-600 border-rose-100',
  'bg-teal-50 text-teal-600 border-teal-100',
];

const genId = () => Math.random().toString(36).slice(2, 9);
const tagColor = (i) => TAG_COLORS[i % TAG_COLORS.length];

/* ---------- 子组件：技术标签编辑器 ---------- */
function TechEditor({ techs, onAdd, onRemove }) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {techs.map((t, i) => (
          <button
            key={i}
            onClick={() => onRemove(i)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${tagColor(i)} hover:opacity-80 transition`}
          >
            {t} <X size={10} />
          </button>
        ))}
        {techs.length === 0 && <span className="text-xs text-slate-300">还没有技术标签</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="输入技术名，回车添加"
          className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <button onClick={add} className="text-indigo-600 bg-indigo-50 px-3 rounded-lg text-sm font-bold hover:bg-indigo-100 transition">添加</button>
      </div>
    </div>
  );
}

/* ---------- 子组件：兴趣条目编辑器 ---------- */
function ItemsEditor({ items, onAdd, onRemove }) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onRemove(i)}
            className="bg-white border border-slate-200/80 text-slate-600 px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 shadow-sm transition-all duration-200"
            >
            {item} <X size={12} className="text-slate-400 hover:text-red-500 transition-colors" />
          </button>
        ))}
        {items.length === 0 && <span className="text-xs text-slate-300">还没有内容</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="输入内容，回车添加"
          className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <button onClick={add} className="text-indigo-600 bg-indigo-50 px-3 rounded-lg text-sm font-bold hover:bg-indigo-100 transition">添加</button>
      </div>
    </div>
  );
}

/* ---------- 主组件 ---------- */
export default function Profile() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatar] = useState('');
  const [selectedAvatarImg, setSelectedAvatarImg] = useState(null);
  const [showAvatarCropper, setShowAvatarCropper] = useState(false);

  const [projectCrop, setProjectCrop] = useState(null);
  const [contactCrop, setContactCrop] = useState(null);

  useEffect(() => {
    const isLogin = localStorage.getItem('is_my_site_admin');
    setIsAdmin(!!isLogin);
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase.from('site_config').select('value').eq('key', 'profile_page_config').single();
    if (data?.value) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(data.value) }); } catch (e) { /* 解析失败用默认 */ }
    }
    const { data: avatarData } = await supabase.from('site_config').select('value').eq('key', 'profile_avatar').single();
    if (avatarData?.value) setAvatar(avatarData.value);
  };

  const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_config').upsert({ key: 'profile_page_config', value: JSON.stringify(config) });
    if (error) {
      alert('保存失败');
    } else {
      alert('保存成功！');
      setEditMode(false);
    }
    setSaving(false);
  };

  /* ---- 头像 ---- */
  const onAvatarSelect = (e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedAvatarImg(reader.result);
        setShowAvatarCropper(true);
      });
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };
  const handleAvatarCropComplete = async (blob) => {
    setShowAvatarCropper(false);
    const fileName = `avatar-${Date.now()}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      await supabase.from('site_config').upsert({ key: 'profile_avatar', value: data.publicUrl });
      setAvatar(data.publicUrl);
    }
  };

  /* ---- 关于我：增删改 + 缩进 + 字号 ---- */
  const addAbout = () => updateConfig({ about: [...config.about, { id: genId(), label: '新项', value: '内容', indent: 0, size: 'base' }] });
  const updateAbout = (id, patch) => updateConfig({ about: config.about.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const removeAbout = (id) => updateConfig({ about: config.about.filter((a) => a.id !== id) });

  /* ---- 技术栈 ---- */
  const addTech = (name) => { if (!name.trim()) return; updateConfig({ techStack: [...config.techStack, { id: genId(), name: name.trim() }] }); };
  const removeTech = (id) => updateConfig({ techStack: config.techStack.filter((t) => t.id !== id) });

  /* ---- 个人项目 ---- */
  const addProject = () => updateConfig({ projects: [...config.projects, { id: genId(), title: '新项目', description: '项目描述', image: '', techs: [], span: 1 }] });
  const updateProject = (id, patch) => updateConfig({ projects: config.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const removeProject = (id) => updateConfig({ projects: config.projects.filter((p) => p.id !== id) });

  const onProjectImageSelect = (id, e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setProjectCrop({ id, imgSrc: reader.result }); });
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };
  const handleProjectCropComplete = async (blob) => {
    const target = projectCrop;
    setProjectCrop(null);
    if (!target) return;
    const fileName = `project-${Date.now()}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      updateProject(target.id, { image: data.publicUrl });
    }
  };

  /* ---- 兴趣爱好 ---- */
  const addInterest = () => updateConfig({ interests: [...config.interests, { id: genId(), category: '新分类', items: [] }] });
  const updateInterest = (id, patch) => updateConfig({ interests: config.interests.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const removeInterest = (id) => updateConfig({ interests: config.interests.filter((i) => i.id !== id) });

  /* ---- 联系我 ---- */
  const addContact = () => updateConfig({ contacts: [...config.contacts, { id: genId(), platform: '新平台', account: '账号ID', link: '', icon: '' }] });
  const updateContact = (id, patch) => updateConfig({ contacts: config.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const removeContact = (id) => updateConfig({ contacts: config.contacts.filter((c) => c.id !== id) });
  const onContactIconSelect = (id, e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setContactCrop({ id, imgSrc: reader.result }); });
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };
  const handleContactCropComplete = async (blob) => {
    const target = contactCrop;
    setContactCrop(null);
    if (!target) return;
    const fileName = `contact-${Date.now()}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      updateContact(target.id, { icon: data.publicUrl });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* 编辑工具栏 */}
      {isAdmin && (
        <div className="flex justify-end gap-2 mb-6">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm font-bold transition">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-60">
                <Save size={16} /> {saving ? '保存中...' : '保存主页'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-5 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold hover:bg-indigo-100 transition flex items-center gap-2">
              <Pencil size={16} /> 编辑主页
            </button>
          )}
        </div>
      )}

      {/* ===== 顶部：头像 + 问候 + 介绍 ===== */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-14">
        <div className="relative mb-6">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-br from-indigo-300 via-pink-300 to-amber-300 shadow-[0_8px_30px_rgba(99,102,241,0.15)]">
            <div className="w-full h-full rounded-full bg-white overflow-hidden">
              {avatar
                ? <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                : <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-300">舤</div>}
            </div>
          </div>
          {editMode && (
            <label className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition border-2 border-white">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarSelect} />
            </label>
          )}
        </div>

        {editMode ? (
          <input
            value={config.greeting}
            onChange={(e) => updateConfig({ greeting: e.target.value })}
            className="text-2xl md:text-4xl font-bold text-slate-800 text-center bg-slate-50 rounded-xl px-4 py-1 outline-none focus:ring-2 focus:ring-indigo-100"
          />
        ) : (
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight">{config.greeting}</h1>
        )}

        <div className="w-12 h-1 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full my-4" />

        {editMode ? (
          <input
            value={config.bio}
            onChange={(e) => updateConfig({ bio: e.target.value })}
            className="text-sm md:text-base text-slate-500 mt-1 text-center bg-slate-50 rounded-xl px-4 py-1 outline-none w-full max-w-lg focus:ring-2 focus:ring-indigo-100"
          />
        ) : (
          <p className="text-sm md:text-base text-slate-500 mt-1 max-w-lg leading-relaxed">{config.bio}</p>
        )}
      </div>

      <div className="space-y-8">
        {/* ===== 关于我 ===== */}
        <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Info size={20} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">关于我</h2>
                <p className="text-xs text-slate-400 mt-0.5">一些关于我的小标签</p>
              </div>
            </div>
            {editMode && (
              <button onClick={addAbout} className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"><Plus size={14} /> 添加</button>
            )}
          </div>
          <div className="space-y-2.5">
            {config.about.map((item) => {
              const sizeClass = SIZE_OPTIONS.find((s) => s.key === item.size)?.className || 'text-base';
              return (
                <div key={item.id} style={{ marginLeft: `${item.indent * 0.75}rem` }}>
                  {editMode ? (
                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 rounded-xl p-2">
                      <input
                        value={item.label}
                        onChange={(e) => updateAbout(item.id, { label: e.target.value })}
                        className="w-24 bg-white border-none rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
                      />
                      <input
                        value={item.value}
                        onChange={(e) => updateAbout(item.id, { value: e.target.value })}
                        className="flex-1 min-w-[120px] bg-white border-none rounded-lg px-3 py-1.5 text-sm outline-none"
                      />
                      <select
                        value={item.size}
                        onChange={(e) => updateAbout(item.id, { size: e.target.value })}
                        className="bg-white border-none rounded-lg px-2 py-1.5 text-xs outline-none"
                      >
                        {SIZE_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateAbout(item.id, { indent: Math.max(0, item.indent - 1) })}
                          className="w-7 h-7 rounded-lg bg-white text-slate-400 hover:text-indigo-600 flex items-center justify-center transition"
                          title="减少缩进"
                        >
                          <IndentDecrease size={14} />
                        </button>
                        <span className="text-xs text-slate-400 w-4 text-center">{item.indent}</span>
                        <button
                          onClick={() => updateAbout(item.id, { indent: Math.min(8, item.indent + 1) })}
                          className="w-7 h-7 rounded-lg bg-white text-slate-400 hover:text-indigo-600 flex items-center justify-center transition"
                          title="增加缩进"
                        >
                          <IndentIncrease size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeAbout(item.id)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-300 hover:text-red-500 flex items-center justify-center transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3 py-1.5">
                      <span className="text-slate-400 text-sm font-bold w-20 shrink-0">{item.label}</span>
                      <span className={`${sizeClass} text-slate-700 font-medium`}>{item.value}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {config.about.length === 0 && <p className="text-center text-slate-300 text-sm py-4">还没有添加内容</p>}
          </div>
        </section>

        {/* ===== 技术栈 ===== */}
        <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Code2 size={20} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">技术栈</h2>
              <p className="text-xs text-slate-400 mt-0.5">我会使用的工具与技术</p>
            </div>
          </div>
          {editMode ? (
            <TechEditor
              techs={config.techStack.map((t) => t.name)}
              onAdd={addTech}
              onRemove={(i) => removeTech(config.techStack[i]?.id)}
            />
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {config.techStack.map((t, i) => (
                <span key={t.id} className={`px-4 py-1.5 rounded-full text-sm font-medium border ${tagColor(i)} transition hover:scale-105`}>{t.name}</span>
              ))}
              {config.techStack.length === 0 && <p className="text-center text-slate-300 text-sm">还没有添加内容</p>}
            </div>
          )}
        </section>

        {/* ===== 个人项目 ===== */}
        <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><FolderGit2 size={20} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">个人项目</h2>
                <p className="text-xs text-slate-400 mt-0.5">我做过的有趣的东西</p>
              </div>
            </div>
            {editMode && (
              <button onClick={addProject} className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"><Plus size={14} /> 添加项目</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.projects.map((p) => (
              <div
                key={p.id}
                className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ${p.span === 2 ? 'sm:col-span-2 lg:col-span-2' : ''} ${editMode ? 'ring-2 ring-indigo-100' : ''}`}
              >
                {/* 封面图 */}
                <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                  {p.image
                    ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={p.title} />
                    : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>}
                  {editMode && (
                    <>
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition">
                        <Camera size={24} />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onProjectImageSelect(p.id, e)} />
                      </label>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => updateProject(p.id, { span: p.span === 2 ? 1 : 2 })}
                          className="px-2 py-1 rounded-lg bg-white/90 text-slate-600 text-xs font-bold shadow hover:bg-white"
                          title="切换卡片宽度"
                        >
                          {p.span === 2 ? '窄' : '宽'}
                        </button>
                        <button
                          onClick={() => removeProject(p.id)}
                          className="w-7 h-7 rounded-lg bg-white/90 text-red-500 flex items-center justify-center shadow hover:bg-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {/* 内容 */}
                <div className="p-5">
                  {editMode ? (
                    <input
                      value={p.title}
                      onChange={(e) => updateProject(p.id, { title: e.target.value })}
                      className="w-full text-lg font-bold text-slate-800 bg-slate-50 rounded-lg px-2 py-1 outline-none mb-2 focus:ring-2 focus:ring-indigo-100"
                    />
                  ) : (
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{p.title}</h3>
                  )}
                  {editMode ? (
                    <textarea
                      value={p.description}
                      onChange={(e) => updateProject(p.id, { description: e.target.value })}
                      rows={2}
                      className="w-full text-sm text-slate-500 bg-slate-50 rounded-lg px-2 py-1 outline-none mb-3 resize-none focus:ring-2 focus:ring-indigo-100"
                    />
                  ) : (
                    <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-3">{p.description}</p>
                  )}
                  {editMode ? (
                    <TechEditor
                      techs={p.techs}
                      onAdd={(t) => updateProject(p.id, { techs: [...p.techs, t] })}
                      onRemove={(i) => updateProject(p.id, { techs: p.techs.filter((_, idx) => idx !== i) })}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {p.techs.map((t, i) => (
                        <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tagColor(i)}`}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {config.projects.length === 0 && <p className="text-center text-slate-300 text-sm py-6">还没有添加项目</p>}
        </section>

        {/* ===== 兴趣爱好 ===== */}
        <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center"><Heart size={20} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">兴趣爱好</h2>
                <p className="text-xs text-slate-400 mt-0.5">工作之外的小世界</p>
              </div>
            </div>
            {editMode && (
              <button onClick={addInterest} className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"><Plus size={14} /> 添加分类</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.interests.map((int, idx) => (
                <div 
                key={int.id}
                className="bg-slate-50/60 hover:bg-slate-50/90 border border-slate-100/80 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between"
                >
                <div>
                    <div className="flex items-center justify-between mb-3">
                    {editMode ? (
                        <input
                        value={int.category}
                        onChange={(e) => updateInterest(int.id, { category: e.target.value })}
                        className="bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-xl text-xs font-bold outline-none w-28 focus:ring-2 focus:ring-indigo-100"
                        />
                    ) : (
                        <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-300 to-pink-400" />
                        <span className="text-sm font-bold text-slate-700 tracking-wide">{int.category}</span>
                        </div>
                    )}
                    {editMode && (
                        <button onClick={() => removeInterest(int.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    )}
                    </div>

                    {editMode ? (
                    <ItemsEditor
                        items={int.items}
                        onAdd={(t) => updateInterest(int.id, { items: [...int.items, t] })}
                        onRemove={(i) => updateInterest(int.id, { items: int.items.filter((_, idx) => idx !== i) })}
                    />
                    ) : (
                    <div className="flex flex-wrap gap-2">
                        {int.items.map((item, i) => (
                        <span 
                            key={i} 
                            className="bg-white text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 hover:border-indigo-100 transition-all duration-200"
                        >
                            {item}
                        </span>
                        ))}
                        {int.items.length === 0 && <span className="text-xs text-slate-300">还没有内容</span>}
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>
          {config.interests.length === 0 && <p className="text-center text-slate-300 text-sm py-4">还没有添加内容</p>}
        </section>

        {/* ===== 联系我 ===== */}
        <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center"><Mail size={20} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">联系我</h2>
                <p className="text-xs text-slate-400 mt-0.5">在这些地方可以找到我</p>
              </div>
            </div>
            {editMode && (
              <button onClick={addContact} className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"><Plus size={14} /> 添加方式</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.contacts.map((c) => {
              const Wrapper = c.link ? 'a' : 'div';
              const wrapperProps = c.link ? { href: c.link, target: '_blank', rel: 'noreferrer' } : {};
              return editMode ? (
                <div key={c.id} className="bg-slate-50/60 border border-slate-100/80 rounded-2xl p-4 ring-2 ring-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden relative group shrink-0">
                      {c.icon
                        ? <img src={c.icon} className="w-full h-full object-contain p-1" alt={c.platform} />
                        : <Camera size={18} className="text-slate-300" />}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => onContactIconSelect(c.id, e)} />
                    </label>
                    <input
                      value={c.platform}
                      onChange={(e) => updateContact(c.id, { platform: e.target.value })}
                      className="flex-1 bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <button onClick={() => removeContact(c.id)} className="text-slate-300 hover:text-red-500 transition shrink-0"><Trash2 size={16} /></button>
                  </div>
                  <input
                    value={c.account}
                    onChange={(e) => updateContact(c.id, { account: e.target.value })}
                    placeholder="账号ID"
                    className="w-full bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm outline-none mb-2 focus:ring-2 focus:ring-indigo-100"
                  />
                  <input
                    value={c.link}
                    onChange={(e) => updateContact(c.id, { link: e.target.value })}
                    placeholder="跳转链接 (可留空)"
                    className="w-full bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    onClick={() => updateContact(c.id, { icon: '' })}
                    className="mt-2 text-xs text-slate-400 hover:text-red-500 transition"
                  >
                    清除图标
                  </button>
                </div>
              ) : (
                <Wrapper
                  key={c.id}
                  {...wrapperProps}
                  className={`flex items-center gap-3 bg-slate-50/60 border border-slate-100/80 rounded-2xl p-4 transition-all duration-300 ${c.link ? 'hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {c.icon
                      ? <img src={c.icon} className="w-full h-full object-contain p-1" alt={c.platform} />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold">{c.platform.slice(0, 1)}</div>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{c.platform}</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{c.account}</p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
          {config.contacts.length === 0 && <p className="text-center text-slate-300 text-sm py-4">还没有添加内容</p>}
        </section>
      </div>

      {/* 裁剪弹窗：头像 */}
      {showAvatarCropper && (
        <ImageCropper imageSrc={selectedAvatarImg} aspect={1} onCancel={() => setShowAvatarCropper(false)} onCropComplete={handleAvatarCropComplete} />
      )}
      {/* 裁剪弹窗：项目封面 */}
      {projectCrop && (
        <ImageCropper imageSrc={projectCrop.imgSrc} aspect={16 / 9} onCancel={() => setProjectCrop(null)} onCropComplete={handleProjectCropComplete} />
      )}
      {/* 裁剪弹窗：联系方式图标 */}
      {contactCrop && (
        <ImageCropper imageSrc={contactCrop.imgSrc} aspect={1} onCancel={() => setContactCrop(null)} onCropComplete={handleContactCropComplete} />
      )}
    </div>
  );
}
