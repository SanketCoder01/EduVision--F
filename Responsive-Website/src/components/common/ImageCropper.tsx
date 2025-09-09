import { motion } from "motion/react";
import { useState, useRef } from "react";

interface ImageCropperProps {
  src: string;
  onCrop: (croppedImage: string) => void;
  onClose: () => void;
}

export function ImageCropper({ src, onCrop, onClose }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = crop.width;
      canvas.height = crop.height;
      
      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      );
      
      const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
      onCrop(croppedImage);
    };
    img.src = src;
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Crop Image</h3>
        
        <div className="relative mb-4">
          <img src={src} alt="Crop preview" className="max-w-full h-auto" />
          <div 
            className="absolute border-2 border-blue-500 cursor-move"
            style={{
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetX = e.clientX - rect.left;
              const offsetY = e.clientY - rect.top;
              
              const handleMouseMove = (e: MouseEvent) => {
                if (!isDragging) return;
                setCrop(prev => ({
                  ...prev,
                  x: Math.max(0, e.clientX - offsetX),
                  y: Math.max(0, e.clientY - offsetY)
                }));
              };
              
              const handleMouseUp = () => {
                setIsDragging(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleCrop}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}