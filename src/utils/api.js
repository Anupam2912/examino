/**
 * Makes a request to the face recognition API to match faces
 * @param {string} capturedImageUrl - URL of the captured image
 * @param {string} referenceImageUrl - URL of the reference image
 * @returns {Promise<boolean>} - Whether the faces match
 */
export async function matchFaces(capturedImageUrl, referenceImageUrl) {
  try {
    const response = await fetch('http://localhost:5000/match-face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: capturedImageUrl,
        referenceUrl: referenceImageUrl,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to match faces');
    }
    
    const data = await response.json();
    return data.matched;
  } catch (error) {
    console.error('Error matching faces:', error);
    throw error;
  }
}
