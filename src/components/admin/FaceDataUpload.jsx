import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '../../supabase/config';
import * as faceapi from 'face-api.js';
import { encryptData } from '../../utils/encryption';

export default function FaceDataUpload({ studentId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
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
  
  const captureImage = useCallback(async () => {
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
  }, [webcamRef, modelsLoaded]);
  
  const retakeImage = () => {
    setCapturedImage(null);
    setFaceDetected(false);
    setError(null);
  };
  
  const saveFaceData = async () => {
    if (!capturedImage || !faceDetected || !studentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create an HTML image element from the captured image
      const img = new Image();
      img.src = capturedImage;
      await new Promise(resolve => { img.onload = resolve; });
      
      // Get face descriptor
      const detections = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        throw new Error('No face detected');
      }
      
      // Encrypt face descriptor
      const faceDescriptor = Array.from(detections.descriptor);
      const encryptedFaceData = encryptData(JSON.stringify(faceDescriptor));
      
      // Save to Supabase
      const { error: updateError } = await supabase
        .from('students')
        .update({ face_data: encryptedFaceData })
        .eq('id', studentId);
      
      if (updateError) throw updateError;
      
      // Upload image to storage
      const fileName = `${studentId}_reference.jpg`;
      const filePath = `reference/${fileName}`;
      
      // Remove data URL prefix
      const base64Data = capturedImage.split(',')[1];
      
      const { error: uploadError } = await supabase.storage
        .from('students')
        .upload(filePath, decode(base64Data), {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      onSuccess();
    } catch (error) {
      console.error('Error saving face data:', error);
      setError('Failed to save face data. Please try again.');
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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Face Recognition Setup</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
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
            disabled={loading || !modelsLoaded}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {!modelsLoaded ? 'Loading Models...' : 'Capture Image'}
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
              onClick={saveFaceData}
              disabled={loading || !faceDetected}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Face Data'}
            </button>
          </>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Instructions:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Ensure the student's face is clearly visible and well-lit</li>
          <li>The face should be centered in the circular guide</li>
          <li>Remove glasses, hats, or other items that obscure facial features</li>
          <li>Maintain a neutral expression</li>
        </ul>
      </div>
    </div>
  );
}
