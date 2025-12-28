import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './ViewPets.css';

function AdminPetsPage() {
	const navigate = useNavigate();
	return (
		<div className="view-pets-container">
			<AdminNavbar />
			<div className="view-pets-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem' }}>
				<h1>Pets Management</h1>
				<div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
					<button className="category-btn available" onClick={() => navigate('/admin/available-pets')}>Available Pets</button>
					<button className="category-btn adopted" onClick={() => navigate('/admin/adopted-pets')}>Adopted Pets</button>
				</div>
			</div>
		</div>
	);
}

export default AdminPetsPage;
