import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LexicalEditor from './LexicalEditor';
import './LexicalEditor.css';

const BlogForm = ({ user, categories = [], onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // always start empty for new blog
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');

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
  }, []);

  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8000/api/blogs/', {
        title,
        content,
        category_id: category || null,
        tag_ids: selectedTags,
      }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setTitle('');
      setContent('');
      setCategory('');
      setSelectedTags([]);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create blog');
    }
  };

  if (!user || !user.user.is_superuser) return null;

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 32}}>
      <h3>Create New Blog</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <LexicalEditor
        value={content}
        onChange={setContent}
      />
      <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%', marginBottom:12, borderRadius:6, border:'1px solid #cfd8dc', padding:10}}>
        <option value="">Select Category (optional)</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <select multiple value={selectedTags} onChange={handleTagChange} style={{width:'100%', marginBottom:12, borderRadius:6, border:'1px solid #cfd8dc', padding:10}}>
        {tags.map(tag => (
          <option key={tag.id} value={tag.id}>{tag.name}</option>
        ))}
      </select>
      <button type="submit">Create</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default BlogForm;
