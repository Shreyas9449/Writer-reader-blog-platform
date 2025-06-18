import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './components/Profile';
import BlogForm from './components/BlogForm';
import EditBlogForm from './components/EditBlogForm';
import WriterDashboard from './components/WriterDashboard';
import FollowingFeed from './components/FollowingFeed';
import axios from 'axios';

function Home({ user, navigate }) {
  return (
    <div className="home-landing" style={{padding: '2rem 0', textAlign: 'center'}}>
      <h1 style={{fontSize: '2.5rem', marginBottom: 8}}>Welcome to ReaderWriter Blog!</h1>
      <p style={{fontSize: '1.2rem', color: '#555', marginBottom: 24}}>
        A modern blogging platform for writers and readers.<br/>
        Create, edit, and discover blogs. Manage categories, tags, comments, bookmarks, and more.
      </p>
      <div style={{display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32}}>
        {!user && <>
          <button onClick={() => navigate('/login')} className="primary-btn">Login</button>
          <button onClick={() => navigate('/register')} className="secondary-btn">Register</button>
        </>}
        {user && <>
          <button onClick={() => navigate('/profile')} className="primary-btn">My Profile</button>
          {user.user.is_superuser && <button onClick={() => navigate('/dashboard')} className="secondary-btn">Writer Dashboard</button>}
        </>}
        <button onClick={() => navigate('/blogs')} className="secondary-btn">Browse Blogs</button>
      </div>
      <div style={{maxWidth: 700, margin: '0 auto', textAlign: 'left', background: '#f5f7fa', borderRadius: 12, padding: 24}}>
        <h2 style={{marginTop:0}}>Features:</h2>
        <ul style={{fontSize:'1.1rem', lineHeight:1.7}}>
          <li>📝 Rich text blog creation & editing (Lexical Editor)</li>
          <li>🔒 User roles: Writer & Reader</li>
          <li>📚 Categories & Tags management</li>
          <li>💬 Comments, Bookmarks, Likes</li>
          <li>🔍 Search & filter blogs</li>
          <li>👤 Profile with avatar & password change</li>
          <li>✨ Modern, responsive UI</li>
        </ul>
      </div>
    </div>
  );
}

function AppRoutes({ user, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      navigate('/blogs');
    }
  }, [user, navigate]);

  const handleLogin = (data) => {
    setUser(data);
    navigate('/blogs');
  };
  const handleRegister = (data) => {
    setUser(data);
    navigate('/blogs');
  };
  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={<Home user={user} navigate={navigate} />} />
          <Route path="/blogs" element={<BlogList user={user} />} />
          <Route path="/feed" element={<FollowingFeed user={user} />} />
          <Route path="/dashboard" element={<WriterDashboard user={user} />} />
          <Route path="/blog/:id" element={<BlogDetail user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/edit/:id" element={<EditBlogPage user={user} />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function EditBlogPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/blogs/${id}/`).then(res => setBlog(res.data));
    // Fetch all categories across all pages for dropdown
    const fetchCategories = async () => {
      let allCategories = [];
      let page = 1;
      let hasNext = true;
      while (hasNext) {
        const res = await axios.get(`http://localhost:8000/api/categories/?page=${page}`);
        if (Array.isArray(res.data.results)) {
          allCategories = allCategories.concat(res.data.results);
          hasNext = !!res.data.next;
          page += 1;
        } else {
          allCategories = Array.isArray(res.data) ? res.data : [];
          hasNext = false;
        }
      }
      setCategories(allCategories);
    };
    fetchCategories();
  }, [id]);

  if (!user || !user.user.is_superuser) return <div className="container">Unauthorized</div>;
  if (!blog) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <EditBlogForm
        user={user}
        blog={blog}
        categories={categories}
        onSuccess={() => navigate(`/blog/${id}`)}
        onCancel={() => navigate(`/blog/${id}`)}
      />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
