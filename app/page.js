'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Camera, User, Book, MessageCircle, ArrowRight } from 'lucide-react';
// 1. 引入裁剪组件
import ImageCropper from '@/app/components/ImageCropper';

export default function CoverPage() {
  const [bgUrl, setBgUrl] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 2. 新增裁剪相关状态
  const [selectedImg, setSelectedImg] = useState(null); // 选中的原图
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    const isLogin = localStorage.getItem('is_my_site_admin');
    setIsAdmin(!!isLogin);
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase.from('site_config').select('value').eq('key', 'cover_image').single();
    if (data) setBgUrl(data.value);
    else setBgUrl('https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2940&auto=format&fit=crop'); 
  };

  // 3. 用户选图，但不直接上传，而是读出来给裁剪器
  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImg(reader.result);
        setShowCropper(true); // 打开弹窗
      });
      reader.readAsDataURL(file);
      // 清空 input 这里的逻辑可以防止选同一张图不触发onChange
      e.target.value = null; 
    }
  };

  // 4. 裁剪完成后的真正的上传逻辑
  const handleUploadAfterCrop = async (blob) => {
    setShowCropper(false);
    setUploading(true);
    
    // 把 blob 当作文件上传
    const fileName = `cover-${Date.now()}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    
    if (error) {
        alert('上传失败');
    } else {
        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
        await supabase.from('site_config').upsert({ key: 'cover_image', value: data.publicUrl });
        setBgUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const menuBtnStyle = "group flex items-center gap-3 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white px-6 py-4 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/50 hover:pl-8 shadow-lg hover:shadow-xl w-64";

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-900 overflow-hidden">
      
      {/* 背景图层 */}
      {bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${bgUrl})` }}
        >
            <div className="absolute inset-0 bg-black/10" />
        </div>
      )}

      {/* 5. 渲染裁剪弹窗 */}
      {showCropper && (
          <ImageCropper 
            imageSrc={selectedImg} 
            aspect={16 / 9} // 封面图建议 16:9
            onCancel={() => setShowCropper(false)}
            onCropComplete={handleUploadAfterCrop}
          />
      )}

      {/* 核心内容区 */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {/* 左侧菜单 ... (保持不变) */}
        <div className="flex-1 flex flex-col justify-center px-12 md:px-24 space-y-6">
          <div className="mb-8 animate-in slide-in-from-left duration-700">
             <h1 className="text-6xl font-bold text-white drop-shadow-md tracking-tight mb-2">Welcome</h1>
             <p className="text-xl text-white/80 font-medium">欢迎来到我的小世界</p>
          </div>
          <div className="space-y-4 animate-in slide-in-from-left duration-1000 delay-100">
             <Link href="/profile" className={menuBtnStyle}>
                <div className="bg-emerald-400/90 p-2 rounded-xl text-white group-hover:scale-110 transition"><User size={24} /></div>
                <span className="font-bold text-lg tracking-wide">我的主页</span>
                <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" size={20}/>
             </Link>
             <Link href="/notes" className={menuBtnStyle}>
                <div className="bg-pink-300/90 p-2 rounded-xl text-white group-hover:scale-110 transition"><Book size={24} /></div>
                <span className="font-bold text-lg tracking-wide">个人笔记</span>
                <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" size={20}/>
             </Link>
             <Link href="/messages" className={menuBtnStyle}>
                <div className="bg-blue-400/90 p-2 rounded-xl text-white group-hover:scale-110 transition"><MessageCircle size={24} /></div>
                <span className="font-bold text-lg tracking-wide">留言树洞</span>
                <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" size={20}/>
             </Link>
          </div>
        </div>
        <div className="flex-1 hidden md:block"></div>
      </div>

      {/* 管理员更换背景按钮 */}
      {isAdmin && (
        <div className="absolute bottom-8 right-8 z-20">
          <label className="flex items-center gap-2 bg-black/30 backdrop-blur hover:bg-black/50 text-white px-5 py-3 rounded-full cursor-pointer transition shadow-lg border border-white/10">
            <Camera size={20} />
            <span className="text-sm font-medium">{uploading ? '处理中...' : '更换全屏壁纸'}</span>
            {/* 6. input 改为调用 onFileSelect */}
            <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  );
}