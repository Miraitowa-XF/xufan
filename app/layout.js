'use client';
import './globals.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Home, User, Book, MessageCircle, LogIn, LogOut, Flower, Edit2, Camera, X } from 'lucide-react';
import { Noto_Sans_SC } from 'next/font/google';
import ImageCropper from '@/app/components/ImageCropper';

const notoSans = Noto_Sans_SC({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  preload: true,
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [flowerCount, setFlowerCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showVotedMsg, setShowVotedMsg] = useState(false);

  // 个人信息
  const [profile, setProfile] = useState({ name: '加载中...', bio: '...', avatar: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // 裁剪相关
  const [selectedAvatarImg, setSelectedAvatarImg] = useState(null);
  const [showAvatarCropper, setShowAvatarCropper] = useState(false);

  const isCoverPage = pathname === '/';

  useEffect(() => {
    const isLogin = localStorage.getItem('is_my_site_admin');
    setIsAdmin(!!isLogin);
    fetchSiteData();
    const lastVoteDate = localStorage.getItem('last_flower_date');
    if (lastVoteDate === new Date().toDateString()) setHasVoted(true);
  }, []);

  const fetchSiteData = async () => {
    const { data: flower } = await supabase.from('site_config').select('value').eq('key', 'flower_count').single();
    if (flower) setFlowerCount(parseInt(flower.value));

    const { data: nameData } = await supabase.from('site_config').select('value').eq('key', 'profile_name').single();
    const { data: bioData } = await supabase.from('site_config').select('value').eq('key', 'profile_bio').single();
    const { data: avatarData } = await supabase.from('site_config').select('value').eq('key', 'profile_avatar').single();

    setProfile({
        name: nameData?.value || '未设置名字',
        bio: bioData?.value || '未设置签名',
        avatar: avatarData?.value || ''
    });
  };

  const handleSendFlower = async () => {
    if (hasVoted) {
      setShowVotedMsg(true);
      setTimeout(() => setShowVotedMsg(false), 3000);
      return;
    }
    setFlowerCount(prev => prev + 1);
    setHasVoted(true);
    localStorage.setItem('last_flower_date', new Date().toDateString());
    
    const { data } = await supabase.from('site_config').select('value').eq('key', 'flower_count').single();
    if (data) {
        await supabase.from('site_config').update({ value: (parseInt(data.value) + 1).toString() }).eq('key', 'flower_count');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('is_my_site_admin');
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  const openEditProfile = () => {
    setEditForm({ name: profile.name, bio: profile.bio });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const { error: err1 } = await supabase.from('site_config').upsert({ key: 'profile_name', value: editForm.name });
    const { error: err2 } = await supabase.from('site_config').upsert({ key: 'profile_bio', value: editForm.bio });
    if (err1 || err2) {
        alert('保存失败'); return;
    }
    setProfile(prev => ({ ...prev, name: editForm.name, bio: editForm.bio }));
    setIsEditingProfile(false);
    alert('保存成功！');
  };

  const onAvatarSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
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
    setUploadingAvatar(true);
    const fileName = `avatar-${Date.now()}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (!error) {
        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
        await supabase.from('site_config').upsert({ key: 'profile_avatar', value: data.publicUrl });
        setProfile(prev => ({ ...prev, avatar: data.publicUrl }));
    }
    setUploadingAvatar(false);
  };

  const navItems = [
    { name: '封面', href: '/', icon: Home },
    { name: '主页', href: '/profile', icon: User },
    { name: '笔记', href: '/notes', icon: Book },
    { name: '树洞', href: '/messages', icon: MessageCircle },
  ];

  return (
    <html lang="zh">
      <body className={`flex h-screen bg-[#Fdfdfd] text-slate-700 ${notoSans.className}`}>
        
        {/* --- 1. 电脑端侧边栏 (Sidebar) --- */}
        {/* 关键修改：添加 hidden md:flex，表示手机上隐藏，中等屏幕(电脑)以上才显示 */}
        {!isCoverPage && (
          <aside className="hidden md:flex w-72 bg-white/80 backdrop-blur-md border-r border-slate-100 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-all duration-300">
            <div className="p-8 pb-6 flex flex-col items-center border-b border-slate-50 relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-lg relative group">
                 {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300">我</div>}
              </div>
              <h2 className="text-xl font-bold text-slate-800 text-center px-2">{profile.name}</h2>
              <p className="text-sm text-slate-400 mt-2 text-center font-medium leading-relaxed px-4 w-full break-words">{profile.bio}</p>
              {isAdmin && <button onClick={openEditProfile} className="absolute top-2 right-2 p-2 bg-indigo-50 text-indigo-500 rounded-full hover:bg-indigo-100 transition shadow-sm"><Edit2 size={16} /></button>}
            </div>

            <nav className="flex-1 p-6 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-indigo-50/80 text-indigo-600 font-bold shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-6 text-xs text-slate-300 text-center font-medium">© 2025 My Space</div>
          </aside>
        )}

        {/* --- 2. 手机端底部导航栏 (Bottom Nav) --- */}
        {/* 关键修改：md:hidden 表示电脑上隐藏，只有手机显示 */}
        {!isCoverPage && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex justify-around items-center z-40 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    )
                })}
                {/* 手机端的个人信息编辑入口放这里 */}
                {isAdmin && (
                    <button onClick={openEditProfile} className="flex flex-col items-center gap-1 p-2 text-slate-400">
                        <Edit2 size={22} />
                        <span className="text-[10px] font-medium">编辑</span>
                    </button>
                )}
            </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {!isCoverPage && (
              <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0 transition-all duration-300">
                
                {/* --- 背景层分离：手机纯白(不卡顿)，电脑毛玻璃(高级感) --- */}
                <div className="absolute inset-0 bg-white md:bg-white/50 md:backdrop-blur-md border-b border-slate-100 shadow-sm -z-10" />

                {/* --- 左侧区域分离 --- */}
                <div className="flex items-center">
                    {/* 1.【手机端】显示：小头像 + 名字 (解决 My Space 丑的问题) */}
                    <div className="md:hidden flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                        <div className="w-7 h-7 rounded-full bg-white overflow-hidden border border-slate-200 shrink-0">
                           {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[10px]">我</div>}
                        </div>
                        {/* 名字太长自动省略，最大宽度 80px */}
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[80px]">{profile.name}</span>
                    </div>

                    {/* 2.【电脑端】显示：原来的页面标题逻辑 (完全保留) */}
                    <div className="hidden md:block text-lg font-bold text-slate-800 bg-white/50 backdrop-blur px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
                        {navItems.find(i=>i.href===pathname)?.name || 'Page'}
                    </div>
                </div>

                {/* --- 右侧区域分离 --- */}
                <div className="flex items-center gap-3">
                  
                  {/* 花花胶囊：增加 whitespace-nowrap 防止换行 */}
                  <div className="flex items-center bg-white rounded-full border border-pink-100 shadow-[0_2px_8px_rgba(244,114,182,0.1)] p-1 gap-2 md:gap-3 pr-2 md:pr-4 transition-all hover:shadow-[0_4px_12px_rgba(244,114,182,0.2)] whitespace-nowrap">
                    
                    <button 
                        onClick={handleSendFlower}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-500 px-2 py-1.5 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 group shrink-0"
                        title="点我送花"
                    >
                        <span className="text-xs md:text-sm group-hover:rotate-12 transition-transform duration-300 -mt-0.5 leading-none">🌸</span>
                        
                        {/* 【手机端】只显示“送花” (省空间) */}
                        <span className="md:hidden text-[10px] font-bold">送花</span>
                        {/* 【电脑端】显示完整的“送出花花” (保留原样) */}
                        <span className="hidden md:inline text-xs font-bold">送出花花</span>
                    </button>

                    <span className="text-[10px] md:text-xs text-slate-400 font-medium cursor-default">
                        {/* 手机屏幕太小时隐藏“收到”二字 */}
                        <span className="hidden sm:inline">收到 </span>
                        
                        <strong className="text-pink-500 tabular-nums text-xs md:text-sm">{flowerCount}</strong>
                        
                        {/* 【手机端】只显示“朵” */}
                        <span className="md:hidden"> 朵</span>
                        {/* 【电脑端】显示完整的“朵花花” (保留原样) */}
                        <span className="hidden md:inline"> 朵花花</span>
                    </span>

                    {showVotedMsg && (
                      <div className="absolute top-16 right-0 md:right-auto bg-slate-800 text-white text-xs px-3 py-2 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 whitespace-nowrap">
                          明天再来吧~
                      </div>
                    )}
                  </div>

                  {/* 登录状态 (保持原样，仅做微小布局适配) */}
                  {isAdmin ? (
                  <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse shrink-0"></span>
                    <button 
                      onClick={handleLogout} 
                      className="text-slate-400 hover:text-red-500 transition" 
                      title="退出登录"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="text-slate-400 hover:text-indigo-600 transition" title="管理员登录">
                    <LogIn size={18} />
                  </Link>
                )}
                </div>
              </header>
          )}

          {/* 底部留白：手机端 pb-20，电脑端 pb-8 */}
          <div className={`flex-1 overflow-y-auto ${isCoverPage ? 'p-0' : 'p-4 md:p-8 pt-2 pb-20 md:pb-8'}`}>
            {children}
          </div>
        </main>

        {/* 弹窗部分保持不变 (略) */}
        {isEditingProfile && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">编辑资料</h3>
                        <button onClick={()=>setIsEditingProfile(false)}><X size={20} className="text-slate-400"/></button>
                    </div>
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 mb-2 overflow-hidden relative group border-2 border-slate-100">
                             {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300">我</div>}
                             <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer"><Camera size={20} /><input type="file" className="hidden" accept="image/*" onChange={onAvatarSelect} disabled={uploadingAvatar}/></label>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} placeholder="名字"/>
                        <textarea rows={3} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm resize-none" value={editForm.bio} onChange={e=>setEditForm({...editForm, bio: e.target.value})} placeholder="签名"/>
                        <button onClick={handleSaveProfile} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2">保存修改</button>
                    </div>
                </div>
            </div>
        )}

        {showAvatarCropper && (
            <ImageCropper imageSrc={selectedAvatarImg} aspect={1} onCancel={() => setShowAvatarCropper(false)} onCropComplete={handleAvatarCropComplete}/>
        )}
      </body>
    </html>
  );
}