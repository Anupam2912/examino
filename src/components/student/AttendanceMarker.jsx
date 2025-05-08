import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../contexts/AuthContext';
import * as faceapi from 'face-api.js';
import { decryptData } from '../../utils/encryption';

export default function AttendanceMarker() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [matchConfidence, setMatchConfidence] = useState(null);
  const webcamRef = useRef(null);
  
  // Load face-api.js models
  useEffect(() => {
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setError('Failed to load face detection models');
      }
    }
    
    loadModels();
  }, []);
  
  const captureImage = async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    
    if (imageSrc && modelsLoaded) {
      try {
        // Create an HTML image element from the captured image
        const img = new Image();
        img.src = imageSrc;
        await new Promise(resolve => { img.onload = resolve; });
        
        // Detect faces in the image
        const detections = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detections) {
          setFaceDetected(true);
        } else {
          setError('No face detected. Please try again.');
          setCapturedImage(null);
        }
      } catch (error) {
        console.error('Error detecting face:', error);
        setError('Error processing face. Please try again.');
        setCapturedImage(null);
      }
    }
  };
  
  const retakeImage = () => {
    setCapturedImage(null);
    setFaceDetected(false);
    setError(null);
    setSuccess(false);
    setMatchConfidence(null);
  };
  
  const verifyAttendance = async () => {
    if (!capturedImage || !faceDetected || !currentUser || !userProfile?.face_data) {
      setError('Face data not available. Please contact administrator.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create an HTML image element from the captured image
      const img = new Image();
      img.src = capturedImage;
      await new Promise(resolve => { img.onload = resolve; });
      
      // Get face descriptor from captured image
      const detections = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        throw new Error('No face detected');
      }
      
      // Get stored face descriptor
      const storedDescriptorString = decryptData(userProfile.face_data);
      const storedDescriptor = new Float32Array(JSON.parse(storedDescriptorString));
      
      // Compare face descriptors
      const distance = faceapi.euclideanDistance(detections.descriptor, storedDescriptor);
      const threshold = 0.6; // Lower is more strict
      const match = distance < threshold;
      const confidence = 1 - (distance / threshold);
      
      setMatchConfidence(confidence);
      
      if (!match) {
        throw new Error('Face verification failed. Please try again.');
      }
      
      // Get device info
      const deviceInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`
      };
      
      // Save to Supabase
      const { error: insertError } = await supabase
        .from('attendance')
        .insert({
          student_id: currentUser.id,
          status: true,
          confidence: confidence,
          device_info: deviceInfo
        });
      
      if (insertError) throw insertError;
      
      // Upload image to storage
      const fileName = `${currentUser.id}_${new Date().toISOString()}.jpg`;
      const filePath = `attendance/${fileName}`;
      
      // Remove data URL prefix
      const base64Data = capturedImage.split(',')[1];
      
      const { error: uploadError } = await supabase.storage
        .from('students')
        .upload(filePath, decode(base64Data), {
          contentType: 'image/jpeg'
        });
      
      if (uploadError) throw uploadError;
      
      setSuccess(true);
    } catch (error) {
      console.error('Error verifying attendance:', error);
      setError(error.message || 'Failed to verify attendance. Please try again.');
    } finally {
      setLoading(false);
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
  
  // Check if face data is registered
  const isFaceRegistered = !!userProfile?.face_data;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
      
      {!isFaceRegistered && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
          Face recognition is not set up for your account. Please contact your administrator.
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Attendance marked successfully!</span>
          </div>
          {matchConfidence !== null && (
            <div className="mt-2">
              <p className="text-sm">Match confidence: {(matchConfidence * 100).toFixed(2)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className={`h-2.5 rounded-full ${
                    matchConfidence > 0.8 
                      ? 'bg-green-600' 
                      : matchConfidence > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${matchConfidence * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mb-6">
        {!capturedImage ? (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
              className="w-full rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-dashed border-blue-500 rounded-full opacity-70"></div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full rounded-lg"
            />
            {faceDetected && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                Face Detected
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-4">
        {!capturedImage ? (
          <button
            onClick={captureImage}
            disabled={loading || !modelsLoaded || !isFaceRegistered}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {!modelsLoaded ? 'Loading Models...' : 'Capture Image'}
          </button>
        ) : success ? (
          <button
            onClick={retakeImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Mark Another Attendance
          </button>
        ) : (
          <>
            <button
              onClick={retakeImage}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Retake
            </button>
            <button
              onClick={verifyAttendance}
              disabled={loading || !faceDetected}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Mark Attendance'}
            </button>
          </>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Instructions:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Ensure your face is clearly visible and well-lit</li>
          <li>Position your face within the circular guide</li>
          <li>Remove glasses, hats, or other items that obscure facial features</li>
          <li>Maintain a neutral expression</li>
        </ul>
      </div>
    </div>
  );
}
