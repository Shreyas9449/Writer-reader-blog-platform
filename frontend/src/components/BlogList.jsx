import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const BlogList = ({ user }) => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const navigate = useNavigate();

  const fetchBlogs = (pageNum = 1) => {
    axios.get(`http://localhost:8000/api/blogs/?page=${pageNum}`)
      .then(res => {
        setBlogs(res.data.results);
        setFilteredBlogs(res.data.results);
        setCount(Math.ceil(res.data.count / 5));
      });
  };

  // Fetch all categories across all pages
  const fetchCategories = React.useCallback(async () => {
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
        // fallback for non-paginated response
        allCategories = Array.isArray(res.data) ? res.data : [];
        hasNext = false;
      }
    }
    setCategories(allCategories);
  }, []);

  useEffect(() => {
    fetchBlogs(page);
    fetchCategories();
  }, [page, fetchCategories]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredBlogs(
      blogs.filter(blog =>
        blog.title.toLowerCase().includes(value.toLowerCase()) ||
        blog.author.username.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/blogs/${id}/`, {
        headers: { Authorization: `Token ${user.token}` }
      });
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog');
    }
  };

  return (
    <div className="blog-list-container" style={{maxWidth:900, margin:'0 auto', marginTop:32}}>
      <h2 style={{textAlign:'center', marginBottom:32, color:'#1976d2', letterSpacing:1}}>Browse Blogs</h2>
      <div style={{display:'flex', justifyContent:'center', marginBottom:32}}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={handleSearch}
          style={{width: '60%', padding: 14, borderRadius: 8, border:'1px solid #cfd8dc', fontSize:'1.1rem', boxShadow:'0 1px 4px #e3e3e3'} }
        />
      </div>
      {(search ? filteredBlogs : blogs).length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:32}}>No blogs found.</div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:24}}>
        {(search ? filteredBlogs : blogs).map(blog => (
          <div className="blog-list-item" key={blog.id} style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #e3e3e3', padding:28, marginBottom:0, display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:220}}>
            <h3 style={{marginBottom:8, color:'#181818'}}><Link to={`/blog/${blog.id}`}>{blog.title}</Link></h3>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:4}}>
              <span>By <b>{blog.author.username}</b></span>
              {blog.author.follower_count !== undefined && (
                <span style={{background:'#f5f5f5', borderRadius:6, padding:'2px 10px', fontSize:13, color:'#181818', border:'1px solid #eee'}}>
                  {blog.author.follower_count} followers
                </span>
              )}
            </div>
            {blog.category && <p style={{fontSize:'0.95em', color:'#ff5e00', marginBottom:4}}>Category: {blog.category.name}</p>}
            {user && user.user.is_superuser && user.user.id === blog.author.id && (
              <div style={{marginTop:8}}>
                <button onClick={() => navigate(`/edit/${blog.id}`)} style={{marginRight:8}}>Edit</button>
                <button onClick={() => handleDelete(blog.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        </div>
      )}
      <div style={{marginTop:32, display:'flex', justifyContent:'center', gap:8}}>
        {Array.from({length: count}, (_, i) => (
          <button key={i+1} onClick={() => setPage(i+1)} style={{background: page === i+1 ? '#1976d2' : '#fff', color: page === i+1 ? '#fff' : '#1976d2', border: '1px solid #1976d2', minWidth:40, borderRadius:6}}>{i+1}</button>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
