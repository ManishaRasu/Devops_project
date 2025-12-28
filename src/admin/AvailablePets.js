
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import ImageModal from '../components/ImageModal';
import './ViewPets.css';


function AvailablePets() {
	const { isAuthenticated, isAdmin, user } = useAuth();
	const navigate = useNavigate();
	const [pets, setPets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [modalImage, setModalImage] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Debug log
	console.log('AvailablePets Auth:', { isAuthenticated, isAdmin, user });

	useEffect(() => {
		if (!isAuthenticated || !isAdmin) {
			navigate('/admin-login');
		}
	}, [isAuthenticated, isAdmin, navigate]);

	useEffect(() => {
		axios.get('http://localhost:5000/api/pets')
			.then(res => {
				setPets(Array.isArray(res.data) ? res.data.filter(pet => pet.status === 'available' || !pet.status) : []);
			})
			.catch(() => setError('Failed to fetch pets'))
			.finally(() => setLoading(false));
	}, []);

	const handleImageClick = (pet) => {
		setModalImage({ url: pet.image, alt: `${pet.name} - ${pet.breed}` });
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
		setModalImage(null);
	};

	if (!isAuthenticated || !isAdmin) {
		return (
			<div className="view-pets-container">
				<AdminNavbar />
				<div className="loading">Not authorized or not logged in as admin.</div>
			</div>
		);
	}

	return (
		<div className="view-pets-container">
			<AdminNavbar />
			<div className="view-pets-content">
				<h2>Available Pets</h2>
				{loading ? (
					<div className="loading">Loading pets...</div>
				) : error ? (
					<div className="error-message">{error}</div>
				) : (
					<div className="pets-grid">
						{pets.length === 0 ? (
							<div className="no-pets">No available pets</div>
						) : (
							pets.map((pet) => (
								<div key={pet._id} className="pet-card">
									<div className="pet-image">
										<img src={pet.image} alt={pet.name} onClick={() => handleImageClick(pet)} style={{ cursor: 'pointer' }} />
										<div className="pet-status available">Available</div>
									</div>
									<div className="pet-info">
										<h3>{pet.name}</h3>
										<p className="pet-breed">{pet.breed}</p>
										<p className="pet-type">{pet.type} • {pet.age} years old</p>
										{pet.listingType === 'sale' && pet.price && (
											<p className="pet-price"><strong>Price: ₹{pet.price}</strong></p>
										)}
										<p className="pet-description">{pet.description}</p>
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>
			<ImageModal isOpen={isModalOpen} imageUrl={modalImage?.url} altText={modalImage?.alt} onClose={closeModal} />
		</div>
	);
}

export default AvailablePets;
