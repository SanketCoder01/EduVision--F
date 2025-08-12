'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, X, ChevronLeft, Camera, Loader2, UserCheck, MapPin } from 'lucide-react';
import Webcam from 'react-webcam';

// Mock data
const MOCK_SUBJECT_DETAILS = {
  id: 'cs101',
  name: 'Data Structures',
  faculty: 'Dr. Alan Turing',
  history: [
    { date: '2023-10-15', status: 'present' },
    { date: '2023-10-14', status: 'present' },
    { date: '2023-10-13', status: 'absent' },
    { date: '2023-10-12', status: 'present' },
    { date: '2023-10-11', status: 'present' },
  ],
};

const TIME_SLOTS = [
  '10:00 - 10:50', '10:50 - 11:50', '12:30 - 13:30',
  '13:30 - 14:30', '14:50 - 15:50', '15:50 - 16:50',
];

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: 'user',
};

export default function SubjectAttendancePage({ params }: { params: { subjectId: string } }) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  const webcamRef = useRef<Webcam>(null);

  const getClassrooms = (floor: string) => {
    if (!floor) return [];
    const floorNum = parseInt(floor);
    if (floorNum === 0) return ['Seminar Hall'];
    return Array.from({ length: 7 }, (_, i) => `${floorNum}0${i + 1}`);
  };

  const resetState = () => {
    setShowModal(false);
    setStep(1);
    setSelectedFloor('');
    setSelectedRoom('');
    setSelectedSlot('');
    setIsLoading(false);
    setVerificationStatus('');
  };

  const handleProceedToCamera = () => {
    setStep(4);
  };

  const handleCapture = useCallback(() => {
    setIsLoading(true);
    setVerificationStatus('Detecting face...');
    // Simulate face detection
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        setVerificationStatus('Could not capture image. Try again.');
        setIsLoading(false);
        return;
      }
      // In a real app, you'd send imageSrc to a face detection API
      const faceDetected = Math.random() > 0.1; // 90% success rate
      if (faceDetected) {
        setVerificationStatus('Face detected! Verifying location...');
        // Simulate geolocation check
        setTimeout(() => {
          const locationVerified = Math.random() > 0.2; // 80% success rate
          if (locationVerified) {
            setVerificationStatus('Attendance Marked!');
            setTimeout(resetState, 2000);
          } else {
            setVerificationStatus('Geolocation mismatch. Please try again.');
            setTimeout(() => setStep(1), 2000);
          }
        }, 1500);
      } else {
        setVerificationStatus('Single face not detected. Please try again.');
        setIsLoading(false);
      }
    }, 2000);
  }, [webcamRef]);

  const renderModalContent = () => {
    const modalVariants = { 
      hidden: { opacity: 0, x: 50 }, 
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    };

    switch (step) {
      case 1: // Floor Selection
        return <motion.div key={1} variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
          <h3 className="text-xl font-bold text-center">Select Floor</h3>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 13 }, (_, i) => i).map(num => (
              <button key={num} onClick={() => { setSelectedFloor(num.toString()); setStep(2); }} className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-semibold text-lg">
                {num === 0 ? 'G' : num}
              </button>
            ))}
          </div>
        </motion.div>;

      case 2: // Classroom Selection
        return <motion.div key={2} variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
          <button onClick={() => setStep(1)} className="flex items-center text-sm text-blue-600 font-medium mb-2"><ChevronLeft className="h-4 w-4 mr-1" />Back to Floors</button>
          <h3 className="text-xl font-bold text-center">Select Classroom on Floor {selectedFloor === '0' ? 'G' : selectedFloor}</h3>
          <div className="grid grid-cols-3 gap-3">
            {getClassrooms(selectedFloor).map(room => (
              <button key={room} onClick={() => { setSelectedRoom(room); setStep(3); }} className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium">
                {room}
              </button>
            ))}
          </div>
        </motion.div>;

      case 3: // Time Slot Selection
        return <motion.div key={3} variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
          <button onClick={() => setStep(2)} className="flex items-center text-sm text-blue-600 font-medium mb-2"><ChevronLeft className="h-4 w-4 mr-1" />Back to Classrooms</button>
          <h3 className="text-xl font-bold text-center">Select Time Slot</h3>
          <div className="space-y-2">
            {TIME_SLOTS.map(slot => (
              <button key={slot} onClick={() => setSelectedSlot(slot)} className={`w-full p-3 rounded-xl border-2 text-left transition-colors ${selectedSlot === slot ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <span className="font-medium">{slot}</span>
              </button>
            ))}
          </div>
        </motion.div>;

      case 4: // Camera View
        return <motion.div key={4} variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 text-center">
          <h3 className="text-xl font-bold">Position Your Face</h3>
          <p className="text-sm text-gray-500">Ensure only your face is visible in the circle.</p>
          <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={videoConstraints} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover" />
          </div>
          {isLoading && <p className="mt-4 font-medium text-blue-600 animate-pulse">{verificationStatus}</p>}
        </motion.div>;

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200 z-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{MOCK_SUBJECT_DETAILS.name}</h1>
        <p className="text-md text-gray-500">{MOCK_SUBJECT_DETAILS.faculty}</p>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Attendance History</h2>
        <div className="space-y-2">
          {MOCK_SUBJECT_DETAILS.history.map(item => (
            <motion.div key={item.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-4 text-gray-400" />
                <div className="font-medium text-gray-800">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
              {item.status === 'present' ? (
                <span className="flex items-center text-sm font-semibold text-green-600 bg-green-50 py-1 px-3 rounded-full"><Check className="h-4 w-4 mr-1" /> Present</span>
              ) : (
                <span className="flex items-center text-sm font-semibold text-red-600 bg-red-50 py-1 px-3 rounded-full"><X className="h-4 w-4 mr-1" /> Absent</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-xl flex items-center justify-center">
          <Camera className="h-7 w-7" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50" onClick={resetState}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex-grow overflow-y-auto">
                <AnimatePresence mode="wait">
                  {renderModalContent()}
                </AnimatePresence>
              </div>
              <div className="mt-6">
                {step === 3 && <button onClick={handleProceedToCamera} disabled={!selectedSlot} className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${selectedSlot ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}>Proceed to Verification</button>}
                {step === 4 && <button onClick={handleCapture} disabled={isLoading} className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${!isLoading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}>{isLoading ? <span className="flex items-center justify-center"><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Verifying...</span> : <span className="flex items-center justify-center"><UserCheck className="h-5 w-5 mr-2" />Confirm My Attendance</span>}</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
