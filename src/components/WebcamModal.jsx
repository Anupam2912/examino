import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';

export default function WebcamModal({ onClose }) {
  const webcamRef = useRef(null);
  const { currentUser } = useAuth();
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const capture = useCallback(() => {
    setCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setCapturing(false);
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setError(null);
  };

  const submitAttendance = async () => {
    if (!capturedImage || !currentUser) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Generate a unique filename
      const fileName = `${Date.now()}.jpg`;
      const filePath = `attendance/${currentUser.id}/${fileName}`;

      // Remove data URL prefix
      const imageData = capturedImage.split(',')[1];

      // 2. Upload captured image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('attendance')
        .upload(filePath, decode(imageData), {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('attendance')
        .getPublicUrl(filePath);

      // 4. Create attendance record in database
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          user_id: currentUser.id,
          timestamp: new Date().toISOString(),
          image_url: publicUrl,
          status: 'pending' // Will be verified by backend face recognition
        });

      if (attendanceError) throw attendanceError;

      // 5. Close modal
      onClose();

    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Failed to submit attendance. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to decode base64
  function decode(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Mark Attendance</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-100 rounded-lg overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-auto"
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-auto"
            />
          )}
        </div>

        <div className="mt-4 flex justify-center gap-4">
          {capturedImage ? (
            <>
              <button
                onClick={retake}
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
                disabled={processing}
              >
                Retake
              </button>
              <button
                onClick={submitAttendance}
                className="btn btn-primary"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Submit Attendance'}
              </button>
            </>
          ) : (
            <button
              onClick={capture}
              className="btn btn-primary"
              disabled={capturing}
            >
              {capturing ? 'Capturing...' : 'Capture Photo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
