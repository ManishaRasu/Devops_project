import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './AddPet.css';

function AddPet() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
    listingType: 'adoption',
    price: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin-login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Pet name is required';
    if (!formData.type) errors.type = 'Pet type is required';
    if (!formData.breed.trim()) errors.breed = 'Breed is required';
    if (!formData.age || formData.age <= 0) errors.age = 'Valid age is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!imageFile) errors.image = 'Pet image is required';
    if (formData.listingType === 'sale' && (!formData.price || Number(formData.price) <= 0)) {
      errors.price = 'Valid price is required for sale listings';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);
    setValidationErrors({});

    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('breed', formData.breed);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('listingType', formData.listingType);
      if (formData.listingType === 'sale') {
        formDataToSend.append('price', formData.price);
      }
      formDataToSend.append('image', imageFile);

      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('FormData contents:', {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        age: formData.age,
        description: formData.description,
        imageFile: imageFile ? imageFile.name : 'No file'
      });

      await axios.post('http://localhost:5000/api/pets', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let axios set it automatically for FormData
        }
      });

      setSuccess('Pet added successfully! ✓');
      setFormData({
        name: '',
        type: '',
        breed: '',
        age: '',
        gender: '',
        description: '',
        listingType: 'adoption',
        price: ''
      });
      setImageFile(null);
      setImagePreview(null);
      // Reset file input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      // Auto-hide success after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error adding pet:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div>
      <AdminNavbar />
      <div className="main-content">
        <div className="page-container">
          <div className="add-pet-header">
            <h1>Add New Pet</h1>
            <p>Add a new pet to the adoption platform</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="add-pet-form">
            <div className="form-group">
              <label htmlFor="name">Pet Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter pet name"
                className={validationErrors.name ? 'input-error' : ''}
              />
              {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Pet Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className={validationErrors.type ? 'input-error' : ''}
              >
                <option value="">Select pet type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Fish">Fish</option>
                <option value="Other">Other</option>
              </select>
              {validationErrors.type && <span className="field-error">{validationErrors.type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="breed">Breed *</label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
                placeholder="Enter breed"
                className={validationErrors.breed ? 'input-error' : ''}
              />
              {validationErrors.breed && <span className="field-error">{validationErrors.breed}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age (years) *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="20"
                placeholder="Enter age in years"
                className={validationErrors.age ? 'input-error' : ''}
              />
              {validationErrors.age && <span className="field-error">{validationErrors.age}</span>}
            </div>


            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={validationErrors.gender ? 'input-error' : ''}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {validationErrors.gender && <span className="field-error">{validationErrors.gender}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe the pet's personality, health, and special needs"
                className={validationErrors.description ? 'input-error' : ''}
              />
              {validationErrors.description && <span className="field-error">{validationErrors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="listingType">Listing Type *</label>
              <select
                id="listingType"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
              >
                <option value="adoption">Adoption</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            {formData.listingType === 'sale' && (
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required={formData.listingType === 'sale'}
                  min="1"
                  placeholder="Enter price in rupees"
                  className={validationErrors.price ? 'input-error' : ''}
                />
                {validationErrors.price && <span className="field-error">{validationErrors.price}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="image">Pet Image *</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                required
                className={validationErrors.image ? 'input-error' : ''}
              />
              {validationErrors.image && <span className="field-error">{validationErrors.image}</span>}
              <small className="form-note">
                Please select an image file (JPEG, PNG, or GIF). Max size: 5MB
              </small>

              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Pet preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginTop: '10px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Adding Pet...' : 'Add Pet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPet;
