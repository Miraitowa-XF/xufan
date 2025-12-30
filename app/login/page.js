'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hashString = async (str) => {
    // 确保处理的是字符串并转为 UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const TARGET_USER_HASH = "1eabdac43f8bd7da2d4805d226511d6b4ba8f827ce47569d87ba7bb6caf8c6e3";
    const TARGET_PASS_HASH = "d58724aaf46758621df8db014623418502bf530ec5262ddad58db43d7b20f3fd";
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const inputUserHash = await hashString(cleanUsername);
    const inputPassHash = await hashString(cleanPassword);
    if (inputUserHash === TARGET_USER_HASH && inputPassHash === TARGET_PASS_HASH) {
      localStorage.setItem('is_my_site_admin', 'true');
      localStorage.setItem('admin_login_time', Date.now()); // 记录时间
      alert("验证通过！");
      router.push('/');
      router.refresh();
    } else {
      alert("账号或密码错误（请按F12查看控制台对比指纹）");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-full pt-20">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4 border">
        <h1 className="text-2xl font-bold text-center text-gray-800">主人验证</h1>
        
        <input 
          type="text" 
          placeholder="账号" 
          value={username} 
          onChange={e=>setUsername(e.target.value)}
          className="w-full border p-3 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <div className="relative">
            <input 
            type="password" 
            placeholder="密码" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition">
          {loading ? '验证中...' : '解锁后台'}
        </button>
      </form>
    </div>
  );
}