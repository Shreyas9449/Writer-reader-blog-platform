import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FollowingFeed = ({ user }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchFeed = async () => {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/blogs/following_feed/', {
        headers: { Authorization: `Token ${user.token}` }
      });
      const data = await res.json();
      setBlogs(data.results || data);
      setLoading(false);
    };
    fetchFeed();
  }, [user]);

  if (!user) return <div className="container">Please log in to see your feed.</div>;

  return (
    <div className="container" style={{maxWidth:900, margin:'0 auto', marginTop:32}}>
      <h2 style={{textAlign:'center', marginBottom:32, color:'#181818', letterSpacing:1}}>Following Feed</h2>
      {loading ? <div style={{textAlign:'center'}}>Loading...</div> : blogs.length === 0 ? (
        <div style={{textAlign:'center', color:'#888'}}>No blogs from users you follow yet.</div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:24}}>
          {blogs.map(blog => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingFeed;
