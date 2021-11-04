import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../styles/nav.css';
function Nav(props) {
	return (
		<div className="nav">
			<div className="nav-header">
				<Header />
			</div>
			<div className="nav-links">
				<div>
					<Link to="/">Home</Link>
				</div>
				<div>
					<Link to="/user">User</Link>
				</div>
				<div>
					<Link to="/makepoll">Make Poll!</Link>
				</div>
			</div>
			<div className="nav-footer">
				<Footer />
			</div>
		</div>
	);
}

export default Nav;
