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

  // 裁剪相关状态
  const [selectedAvatarImg, setSelectedAvatarImg] = useState(null);
  const [showAvatarCropper, setShowAvatarCropper] = useState(false);

  const isCoverPage = pathname === '/';

  useEffect(() => {
    checkUser();
    fetchSiteData();
    const lastVoteDate = localStorage.getItem('last_flower_date');
    if (lastVoteDate === new Date().toDateString()) setHasVoted(true);
  }, []);

  const checkUser = () => {
    const isLogin = localStorage.getItem('is_my_site_admin');
    setIsAdmin(!!isLogin);
  };

  const fetchSiteData = async () => {
    const { data: flower } = await supabase.from('site_config').select('value').eq('key', 'flower_count').single();
    if (flower) setFlowerCount(parseInt(flower.value));

    // 获取个人信息
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

  // --- 打开编辑窗口 ---
  const openEditProfile = () => {
    setEditForm({ name: profile.name, bio: profile.bio });
    setIsEditingProfile(true);
  };

  // --- 保存逻辑 (增加错误提示) ---
  const handleSaveProfile = async () => {
    // 1. 保存名字
    const { error: err1 } = await supabase.from('site_config').upsert({ key: 'profile_name', value: editForm.name });
    // 2. 保存签名
    const { error: err2 } = await supabase.from('site_config').upsert({ key: 'profile_bio', value: editForm.bio });

    if (err1 || err2) {
        alert('保存失败，请检查数据库权限！错误信息: ' + (err1?.message || err2?.message));
        return;
    }

    // 更新前端显示
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

  // --- 头像上传逻辑 ---
  const handleAvatarCropComplete = async (blob) => {
      setShowAvatarCropper(false);
      setUploadingAvatar(true);
      
      const fileName = `avatar-${Date.now()}`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) {
          alert('上传失败: ' + error.message);
      } else {
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          await supabase.from('site_config').upsert({ key: 'profile_avatar', value: data.publicUrl });
          setProfile(prev => ({ ...prev, avatar: data.publicUrl }));
      }
      setUploadingAvatar(false);
  };

  const navItems = [
    { name: '封面页', href: '/', icon: Home },
    { name: '个人主页', href: '/profile', icon: User },
    { name: '笔记', href: '/notes', icon: Book },
    { name: '留言树洞', href: '/messages', icon: MessageCircle },
  ];

  return (
    <html lang="zh">
      <body className={`flex h-screen bg-[#Fdfdfd] text-slate-700 ${notoSans.className}`}>
        
        {/* Sidebar */}
        {!isCoverPage && (
          <aside className="w-72 bg-white/80 backdrop-blur-md border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-all duration-300">
            {/* 用户信息卡片 */}
            <div className="p-8 pb-6 flex flex-col items-center border-b border-slate-50 relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-lg relative group">
                 {profile.avatar ? (
                     <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl font-bold bg-slate-50">我</div>
                 )}
                 
                 {/* 只有在弹窗里才能上传头像，这里仅展示 */}
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 tracking-tight text-center px-2">{profile.name}</h2>
              <p className="text-sm text-slate-400 mt-2 text-center font-medium leading-relaxed px-4 break-words w-full">{profile.bio}</p>

              {/* 🔴 修复：编辑按钮一直显示，不再隐藏 */}
              {isAdmin && (
                  <button 
                    onClick={openEditProfile} 
                    className="absolute top-2 right-2 p-2 bg-indigo-50 text-indigo-500 rounded-full hover:bg-indigo-100 transition shadow-sm"
                    title="编辑资料"
                  >
                      <Edit2 size={16} />
                  </button>
              )}
            </div>

            <nav className="flex-1 p-6 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} 
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                    ${isActive 
                        ? 'bg-indigo-50/80 text-indigo-600 font-bold shadow-sm translate-x-1' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 text-xs text-slate-300 text-center font-medium">
                © 2025 My Space
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {!isCoverPage && (
              <header className="h-20 flex items-center justify-between px-8 z-20 sticky top-0">
                <div className="text-lg font-bold text-slate-800 bg-white/50 backdrop-blur px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
                    {navItems.find(i=>i.href===pathname)?.name || 'Page'}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-white px-1.5 py-1.5 rounded-full border border-slate-100 shadow-sm pr-4">
                    <button onClick={handleSendFlower} className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 hover:scale-110 transition active:scale-90">
                        <Flower size={16} fill={hasVoted ? "currentColor" : "none"} />
                    </button>
                    <span className="text-xs font-bold text-slate-600 tabular-nums">{flowerCount} 朵</span>
                    {showVotedMsg && <div className="absolute top-16 right-20 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl animate-bounce">明天再来吧~</div>}
                  </div>

                  {isAdmin ? (
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                      <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition" title="退出">
                        <LogOut size={18} />
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" className="text-slate-400 hover:text-indigo-600 transition">
                      <LogIn size={18} />
                    </Link>
                  )}
                </div>
              </header>
          )}

          <div className={`flex-1 overflow-y-auto ${isCoverPage ? 'p-0' : 'p-8 pt-2'}`}>
            {children}
          </div>
        </main>

        {/* 裁剪弹窗 */}
        {showAvatarCropper && (
            <ImageCropper 
                imageSrc={selectedAvatarImg} 
                aspect={1} // 头像必须是正方形
                onCancel={() => setShowAvatarCropper(false)}
                onCropComplete={handleAvatarCropComplete}
            />
        )}

        {/* --- 编辑弹窗 --- */}
        {isEditingProfile && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">编辑资料</h3>
                        <button onClick={()=>setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                    </div>
                    
                    {/* 头像上传区 */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 mb-2 overflow-hidden relative group cursor-pointer border-2 border-slate-100">
                             {profile.avatar ? (
                                 <img src={profile.avatar} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-300">我</div>
                             )}
                             <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                                 <Camera size={20} />
                                 <input type="file" className="hidden" accept="image/*" onChange={onAvatarSelect} disabled={uploadingAvatar}/>
                             </label>
                        </div>
                        <p className="text-xs text-slate-400">{uploadingAvatar ? '上传中...' : '点击头像更换'}</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-500 font-bold ml-1">名字</label>
                            <input 
                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100" 
                                value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold ml-1">个性签名</label>
                            <textarea 
                                rows={3}
                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 resize-none" 
                                value={editForm.bio} onChange={e=>setEditForm({...editForm, bio: e.target.value})}
                            />
                        </div>
                        <button onClick={handleSaveProfile} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition mt-2">
                            保存修改
                        </button>
                    </div>
                </div>
            </div>
        )}
      </body>
    </html>
  );
}