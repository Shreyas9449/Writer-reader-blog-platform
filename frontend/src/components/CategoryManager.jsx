import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManager = ({ user, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

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
        // fallback for non-paginated response
        allCategories = Array.isArray(res.data) ? res.data : [];
        hasNext = false;
      }
    }
    setCategories(allCategories);
    if (onCategoryChange) onCategoryChange();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8000/api/categories/', { name }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setName('');
      if (onCategoryChange) onCategoryChange(); // only parent fetch
    } catch (err) {
      setError(
        (err.response && JSON.stringify(err.response.data)) ||
        err.message ||
        'Failed to create category'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/categories/${id}/`, {
        headers: { Authorization: `Token ${user.token}` }
      });
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:8000/api/categories/${editId}/`, { name: editName }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setEditId(null);
      setEditName('');
      fetchCategories();
    } catch (err) {
      setError('Failed to update category');
    }
  };

  if (!user || !user.user.is_superuser) return null;

  return (
    <div className="container category-manager" style={{marginBottom:32, background:'#f8fafc', border:'1px solid #e3e8ee', borderRadius:12, boxShadow:'0 2px 8px #e3e3e3', padding:'32px 24px'}}>
      <h3 style={{textAlign:'center', marginBottom:20, color:'#1976d2', letterSpacing:1}}>Manage Categories</h3>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{display:'flex', gap:8, marginBottom:20, alignItems:'center', justifyContent:'center', flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Category name"
          value={editId ? editName : name}
          onChange={e => editId ? setEditName(e.target.value) : setName(e.target.value)}
          required
          style={{flex:'1 1 180px', minWidth:120, maxWidth:220}}
        />
        <button type="submit" style={{minWidth:90}}>{editId ? 'Update' : 'Create'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setEditName(''); }} style={{background:'#e3e8ee', color:'#1976d2', minWidth:90}}>Cancel</button>}
      </form>
      {error && <div className="error" style={{color:'#d32f2f', marginBottom:12, textAlign:'center'}}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center'}}>
        {categories.map(cat => (
          <li key={cat.id} style={{background:'#fff', border:'1px solid #cfd8dc', borderRadius:8, padding:'8px 16px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 1px 4px #e3e3e3'}}>
            <span style={{fontWeight:500}}>{cat.name}</span>
            <button style={{background:'#f4f6fb', color:'#1976d2', border:'none', padding:'4px 10px', borderRadius:6, fontSize:'0.95em'}} onClick={() => handleEdit(cat)}>Edit</button>
            <button style={{background:'#fff0f0', color:'#d32f2f', border:'none', padding:'4px 10px', borderRadius:6, fontSize:'0.95em'}} onClick={() => handleDelete(cat.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;
