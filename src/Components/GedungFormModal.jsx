import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    padding: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

function GedungFormModal({ isOpen, closeModal, gedung, onSubmit, mode }) {
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    if (gedung && mode === 'edit') {
      setFormData({
        name: gedung.name,
        image: null,
        imagePreview: null,
      });
    }
  }, [gedung, mode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setFormData({
        ...formData,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    closeModal();
    setFormData({ name: '', image: null, imagePreview: null });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Gedung Form Modal"
    >
      <h2>{mode === 'edit' ? 'Edit Gedung' : 'Add New Gedung'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nama Gedung</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Foto Gedung</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
          {formData.imagePreview && (
            <img
              src={formData.imagePreview}
              alt="Preview"
              style={{ width: '100%', marginTop: '10px' }}
            />
          )}
        </div>
        <div className="modal-buttons">
          <button type="button" className="secondary-button" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit" className="main-button">
            {mode === 'edit' ? 'Save Changes' : 'Add Gedung'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default GedungFormModal;