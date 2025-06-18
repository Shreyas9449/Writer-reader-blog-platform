import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = ({ user, onLogout }) => (
  <nav className="navbar">
    <div className="navbar-container">
      <Link to="/" className="navbar-logo">BlogApp</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {!user && <><Link to="/register">Register</Link><Link to="/login">Login</Link></>}
        {user && <>
          <Link to="/blogs">Browse Blogs</Link>
          <Link to="/feed">Following Feed</Link>
          {user.user.is_superuser && <Link to="/dashboard">Writer Dashboard</Link>}
          <Link to="/profile">Profile</Link>
          <NotificationBell user={user} />
          <span style={{ color: '#fff', marginLeft: 18 }}>
            Hello, {user.user.username} ({user.user.is_superuser ? 'Writer' : 'Reader'})
          </span>
          <button style={{ marginLeft: 18 }} onClick={onLogout}>Logout</button>
        </>}
      </div>
    </div>
  </nav>
);

export default Navbar;
