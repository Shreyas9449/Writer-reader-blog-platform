import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TagManager = ({ user }) => {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

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

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8000/api/tags/', { name }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setName('');
      fetchTags();
    } catch (err) {
      setError('Failed to create tag');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/tags/${id}/`, {
        headers: { Authorization: `Token ${user.token}` }
      });
      fetchTags();
    } catch (err) {
      setError('Failed to delete tag');
    }
  };

  const handleEdit = (tag) => {
    setEditId(tag.id);
    setEditName(tag.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:8000/api/tags/${editId}/`, { name: editName }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setEditId(null);
      setEditName('');
      fetchTags();
    } catch (err) {
      setError('Failed to update tag');
    }
  };

  if (!user || !user.user.is_superuser) return null;

  return (
    <div className="container tag-manager" style={{marginBottom:32, background:'#f8fafc', border:'1px solid #e3e8ee', borderRadius:12, boxShadow:'0 2px 8px #e3e3e3', padding:'32px 24px'}}>
      <h3 style={{textAlign:'center', marginBottom:20, color:'#1976d2', letterSpacing:1}}>Manage Tags</h3>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{display:'flex', gap:8, marginBottom:20, alignItems:'center', justifyContent:'center', flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Tag name"
          value={editId ? editName : name}
          onChange={e => editId ? setEditName(e.target.value) : setName(e.target.value)}
          required
          style={{flex:'1 1 180px', minWidth:120, maxWidth:220}}
        />
        <button type="submit" style={{minWidth:90}}>{editId ? 'Update' : 'Create'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setEditName(''); }} style={{background:'#e3e8ee', color:'#1976d2', minWidth:90}}>Cancel</button>}
      </form>
      {error && <div className="error" style={{color:'#d32f2f', marginBottom:12, textAlign:'center'}}>{error}</div>}
      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center'}}>
        {tags.map(tag => (
          <li key={tag.id} style={{background:'#fff', border:'1px solid #cfd8dc', borderRadius:8, padding:'8px 16px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 1px 4px #e3e3e3'}}>
            <span style={{fontWeight:500}}>{tag.name}</span>
            <button style={{background:'#f4f6fb', color:'#1976d2', border:'none', padding:'4px 10px', borderRadius:6, fontSize:'0.95em'}} onClick={() => handleEdit(tag)}>Edit</button>
            <button style={{background:'#fff0f0', color:'#d32f2f', border:'none', padding:'4px 10px', borderRadius:6, fontSize:'0.95em'}} onClick={() => handleDelete(tag.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagManager;
