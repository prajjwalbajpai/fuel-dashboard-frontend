import { useState } from 'react';
import { toast } from 'react-toastify';
import './OdometerUpload.css';

const OdometerUpload = ({ onUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
//   const [currentReading, setCurrentReading] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error('Please select an odometer image');
      return;
    }

    setUploading(true);
    
    try {
      await onUpload(selectedImage);
      toast.success('Odometer uploaded successfully!');
      
      // Reset form
      setSelectedImage(null);
      setImagePreview(null);
      // setCurrentReading('');
      
      // Reset file input
      const fileInput = document.getElementById('odometer-image');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error('Failed to upload odometer. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="odometer-upload">
      <h2>📷 Update Odometer Reading</h2>
      
      <div className="upload-section">
        <div className="image-upload-area">
          <input
            type="file"
            id="odometer-image"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          
          <label htmlFor="odometer-image" className="upload-button">
            {imagePreview ? (
              <img src={imagePreview} alt="Odometer preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <p>Click to select odometer image</p>
              </div>
            )}
          </label>
        </div>

        <button 
          onClick={handleUpload}
          disabled={uploading || !selectedImage }
          className="upload-submit-btn"
        >
          {uploading ? (
            <>
              <div className="spinner-small"></div>
              Uploading...
            </>
          ) : (
            'Upload Odometer Image'
          )}
        </button>
      </div>
    </div>
  );
};

export default OdometerUpload;
