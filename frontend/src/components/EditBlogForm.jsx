import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LexicalEditor from './LexicalEditor';
import './LexicalEditor.css';

const EditBlogForm = ({ user, blog, categories, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(() => {
    // If blog.content is valid Lexical JSON, use it, else empty string
    try {
      const parsed = JSON.parse(blog.content);
      if (parsed && typeof parsed === 'object' && parsed.root) return blog.content;
      return '';
    } catch {
      return '';
    }
  });
  const [category, setCategory] = useState(blog.category ? blog.category.id : '');
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(blog.tags ? blog.tags.map(t => t.id) : []);

  useEffect(() => {
    // Fetch all tags across all pages
    const fetchTags = async () => {
      let allTags = [];
      let page = 1;
      let hasNext = true;
      while (hasNext) {
        const res = await axios.get(`http://localhost:8000/api/tags/?page=${page}`);
        if (Array.isArray(res.data.results)) {
          allTags = allTags.concat(res.data.results);
          hasNext = !!res.data.next;
          page += 1;
        } else {
          allTags = Array.isArray(res.data) ? res.data : [];
          hasNext = false;
        }
      }
      setTags(allTags);
    };
    fetchTags();
    if (blog.tags) setSelectedTags(blog.tags.map(t => t.id));
  }, [blog]);

  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:8000/api/blogs/${blog.id}/`, {
        title,
        content,
        category_id: category || null,
        tag_ids: selectedTags,
      }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update blog');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 32, background:'#f8fafc', border:'1px solid #e3e8ee', borderRadius:12, boxShadow:'0 2px 8px #e3e3e3', padding:'32px 24px'}}>
      <h3 style={{textAlign:'center', color:'#1976d2', marginBottom:24}}>Edit Blog</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        style={{marginBottom:16}}
      />
      <LexicalEditor
        value={content}
        onChange={setContent}
      />
      <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%', marginBottom:16, borderRadius:6, border:'1px solid #cfd8dc', padding:10}}>
        <option value="">Select Category (optional)</option>
        {(Array.isArray(categories) ? categories : []).map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <select multiple value={selectedTags} onChange={handleTagChange} style={{width:'100%', marginBottom:16, borderRadius:6, border:'1px solid #cfd8dc', padding:10}}>
        {tags.map(tag => (
          <option key={tag.id} value={tag.id}>{tag.name}</option>
        ))}
      </select>
      <div style={{display:'flex', justifyContent:'center', gap:16, marginTop:16}}>
        <button type="submit" style={{minWidth:120}}>Update</button>
        <button type="button" onClick={onCancel} style={{minWidth:120, background:'#e3e8ee', color:'#1976d2'}}>Cancel</button>
      </div>
      {error && <div className="error" style={{textAlign:'center'}}>{error}</div>}
    </form>
  );
};

export default EditBlogForm;
