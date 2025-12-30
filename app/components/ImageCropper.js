'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/canvasUtils';
import { X, Check } from 'lucide-react';

export default function ImageCropper({ imageSrc, aspect = 1, onCancel, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBlob); // 把切好的图传回去
    } catch (e) {
      console.error(e);
      alert('裁剪失败');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[60vh] bg-black rounded-t-2xl overflow-hidden border border-white/20">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect} // 1 = 正方形(头像), 16/9 = 封面
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
        />
      </div>
      
      {/* 底部控制栏 */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-b-2xl flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-bold">缩放</span>
            <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
        </div>
        
        <div className="flex justify-between gap-4">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">
                取消
            </button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                {loading ? '处理中...' : <><Check size={18}/> 确认使用</>}
            </button>
        </div>
      </div>
    </div>
  );
}