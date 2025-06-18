import React, { useState, useEffect } from 'react';
import BlogForm from './BlogForm';
import CategoryManager from './CategoryManager';
import TagManager from './TagManager';
import axios from 'axios';

const WriterDashboard = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(0);

  // Fetch all categories across all pages
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

  useEffect(() => {
    fetchCategories();
  }, [refresh]);

  if (!user || !user.user.is_superuser) return <div className="container">Unauthorized</div>;

  return (
    <div className="container" style={{maxWidth:900, margin:'0 auto', marginTop:32, background:'#f8fafc', border:'1px solid #e3e8ee', borderRadius:16, boxShadow:'0 2px 12px #e3e3e3', padding:'32px 24px'}}>
      <h2 style={{textAlign:'center', marginBottom:32, color:'#1976d2', letterSpacing:1}}>Writer Dashboard</h2>
      <BlogForm user={user} categories={categories} onSuccess={() => setRefresh(r => r+1)} />
      <div style={{display:'flex', flexWrap:'wrap', gap:32, justifyContent:'space-between'}}>
        <div style={{flex:'1 1 340px', minWidth:320}}>
          <CategoryManager user={user} onCategoryChange={fetchCategories} />
        </div>
        <div style={{flex:'1 1 340px', minWidth:320}}>
          <TagManager user={user} />
        </div>
      </div>
    </div>
  );
};

export default WriterDashboard;
