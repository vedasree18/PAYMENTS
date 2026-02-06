import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  Image as ImageIcon, 
  X, 
  Camera, 
  AlertCircle, 
  Loader2, 
  UploadCloud, 
  CheckCircle2,
  ArrowRight,
  Maximize
} from 'lucide-react';
import jsQR from 'jsqr';
import { DesktopHeader } from '../components/Navigation';
import { Screen, User } from '../types';
import { Button } from '../components/Button';

interface ScanQRProps {
  onBack: () => void;
  onScanSuccess: (upiId: string, name: string) => void;
  user?: User; 
  onLogout?: () => void;
  onNavigate?: (screen: Screen) => void;
}

export const ScanQR: React.FC<ScanQRProps> = ({ 
  onBack, 
  onScanSuccess, 
  user, 
  onLogout, 
  onNavigate 
}) => {
  // --- State ---
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<{id: string, name: string} | null>(null);
  const [manualId, setManualId] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [error, setError] = useState<string>('');
  
  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic: Cleanup ---
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // --- Logic: Process QR Data ---
  const handleDecodedData = (data: string) => {
    if (!scanning && !isProcessingImg) return;

    // 1. UPI URL Format: upi://pay?pa=...&pn=...
    if (data.toLowerCase().startsWith('upi://')) {
      try {
        const urlObj = new URL(data);
        const params = new URLSearchParams(urlObj.search);
        const pa = params.get('pa');
        const pn = params.get('pn');

        if (pa) {
          triggerSuccess(pa, pn || 'Merchant');
          return;
        }
      } catch (e) {
        console.error("Invalid UPI URL", e);
      }
    }

    // 2. Raw UPI ID Format: username@bank
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (upiRegex.test(data)) {
       triggerSuccess(data, 'New Recipient');
       return;
    }

    if (isProcessingImg) {
      setError('Invalid UPI QR code detected.');
      setIsProcessingImg(false);
    }
  };

  const triggerSuccess = (id: string, name: string) => {
    setScanning(false);
    setScanResult({ id, name });
    stopCamera();
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
    
    // Slight delay for visual confirmation before navigation
    setTimeout(() => {
      onScanSuccess(id, name);
    }, 800);
  };

  // --- Logic: Camera Loop ---
  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Scan logic
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleDecodedData(code.data);
        }
      }
    }
    
    if (scanning) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [scanning]);

  // --- Logic: Image Upload ---
  const processFile = (file: File) => {
    setIsProcessingImg(true);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleDecodedData(code.data);
        } else {
          setError('No QR code found in this image.');
          setIsProcessingImg(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // --- Lifecycle: Camera Init ---
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          setPermissionState('granted');
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setPermissionState('denied');
      }
    };

    if (scanning) {
      startCamera();
    }

    return () => stopCamera();
  }, [scanning, tick, stopCamera]);


  // --- Helper: Scan Frame Animation Overlay ---
  const ScanFrame = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`relative z-10 ${mobile ? 'w-64 h-64 border-2 border-white/30' : 'w-full h-full max-w-xs max-h-xs border border-white/30'} rounded-3xl overflow-hidden ${mobile ? 'shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]' : 'shadow-2xl'}`}>
       {/* Frame Border Highlight */}
       <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-3xl"></div>
       
       {/* Corner Accents */}
       <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
       <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
       <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
       <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>
       
       {/* Scanning Laser */}
       <div className="absolute left-2 right-2 h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] animate-scan-line"></div>
    </div>
  );

  // --- Render: Mobile View (Immersive) ---
  const renderMobile = () => (
    <div className="md:hidden fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full backdrop-blur-md text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-white font-medium drop-shadow-md">Scan QR Code</span>
        <div className="w-10"></div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {scanResult ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl animate-fade-in">
             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-pop">
                <CheckCircle2 className="w-10 h-10 text-white" />
             </div>
             <p className="text-white text-xl font-bold">{scanResult.name}</p>
             <p className="text-white/80 font-mono mt-1">{scanResult.id}</p>
          </div>
        ) : (
          <>
            {permissionState === 'prompt' && (
               <div className="absolute z-10 text-white"><Loader2 className="animate-spin w-8 h-8"/></div>
            )}
            
            {/* Video Feed */}
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover" 
              muted 
            />
            
            {/* Overlay */}
            <ScanFrame mobile />

            {/* Instruction */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center z-20">
               <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm border border-white/10">
                  Align QR code within the frame
               </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="bg-black p-8 flex justify-center gap-12 items-center z-20">
        <button 
           onClick={() => fileInputRef.current?.click()}
           className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
           <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
              <ImageIcon className="w-5 h-5" />
           </div>
           <span className="text-[10px] uppercase font-bold tracking-wider">Upload</span>
        </button>
      </div>
    </div>
  );

  // --- Render: Desktop View (Professional) ---
  const renderDesktop = () => (
    <div className="hidden md:flex flex-col min-h-screen bg-gray-50">
      {user && onNavigate && <DesktopHeader currentScreen={Screen.SCAN_QR} onNavigate={onNavigate} user={user} onLogout={onLogout} />}
      
      <div className="flex-1 flex flex-col items-center p-8 max-w-6xl mx-auto w-full">
        
        {/* Breadcrumb / Back */}
        <div className="w-full mb-6 flex items-center justify-between">
           <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
             <ChevronLeft className="w-5 h-5" /> Back to Dashboard
           </button>
           <h1 className="text-2xl font-bold text-gray-900">Scan & Pay</h1>
        </div>

        {/* Success Overlay for Desktop */}
        {scanResult && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-pop">
                    <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Detected</h2>
                 <p className="text-gray-500 mb-6">Proceeding to payment for</p>
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-2">
                    <p className="font-bold text-lg text-gray-900">{scanResult.name}</p>
                    <p className="font-mono text-sm text-gray-500">{scanResult.id}</p>
                 </div>
              </div>
           </div>
        )}

        <div className="grid grid-cols-12 gap-8 w-full h-[600px]">
          
          {/* LEFT COL: Live Camera */}
          <div className="col-span-7 bg-black rounded-[2rem] overflow-hidden relative shadow-xl flex items-center justify-center group">
            {permissionState === 'denied' ? (
              <div className="text-center p-8 text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">Camera Disabled</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                   We can't access your webcam. Please allow permission or use the upload option on the right.
                </p>
                <Button 
                   variant="secondary" 
                   className="mt-6 border-white/10 bg-white/10 text-white hover:bg-white/20"
                   onClick={() => window.location.reload()}
                >
                   Try Again
                </Button>
              </div>
            ) : (
              <>
                 <video 
                   ref={videoRef} 
                   className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                   muted 
                 />
                 <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full border-[24px] border-black/30 backdrop-blur-[2px]"></div>
                 </div>
                 
                 {/* Desktop Scanning Frame */}
                 <div className="relative z-10 w-64 h-64">
                    <ScanFrame />
                 </div>

                 <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-white/80 text-sm font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-md">
                       Point your webcam at a QR code
                    </p>
                 </div>
              </>
            )}
          </div>

          {/* RIGHT COL: Fallback Options */}
          <div className="col-span-5 flex flex-col gap-6">
            
            {/* 1. Drag & Drop Upload */}
            <div 
               className={`flex-1 bg-white rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer relative overflow-hidden ${
                 isDragOver 
                   ? 'border-indigo-500 bg-indigo-50' 
                   : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
               }`}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}
            >
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
               />
               
               {isProcessingImg ? (
                 <div className="flex flex-col items-center">
                   <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                   <p className="font-semibold text-gray-900">Scanning image...</p>
                 </div>
               ) : (
                 <>
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
                      isDragOver ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-50 text-indigo-600'
                   }`}>
                      <UploadCloud className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Upload QR Image</h3>
                   <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                     Drag and drop a screenshot or image of a QR code here, or click to browse.
                   </p>
                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider py-2 px-4 bg-indigo-50 rounded-lg">
                     Browse Files
                   </span>
                 </>
               )}

               {error && (
                 <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                 </div>
               )}
            </div>

            {/* 2. Manual Entry Fallback */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Manual Entry</h3>
               </div>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Enter UPI ID (e.g. name@bank)"
                   className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                   value={manualId}
                   onChange={(e) => setManualId(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && manualId && handleDecodedData(manualId)}
                 />
                 <button 
                   onClick={() => manualId && handleDecodedData(manualId)}
                   className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
                   disabled={!manualId}
                 >
                    <ArrowRight className="w-5 h-5" />
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Styles for animation */}
      <style>{`
        @keyframes scan-line {
          0% { top: 2%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 98%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
      {renderMobile()}
      {renderDesktop()}
    </>
  );
};
