import React, { useState } from 'react';
import axios from 'axios';

const CommentForm = ({ user, blogId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8000/api/comments/', {
        blog: blogId,
        content,
      }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setContent('');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add comment');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginTop: 24}}>
      <h4>Add a Comment</h4>
      <textarea
        placeholder="Write your comment..."
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        rows={3}
        style={{width:'100%', marginBottom:12, borderRadius:6, border:'1px solid #cfd8dc', padding:10}}
      />
      <button type="submit">Post Comment</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default CommentForm;
