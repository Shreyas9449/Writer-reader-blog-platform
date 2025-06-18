import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LikeButton = ({ user, blogId, likeCount: initialLikeCount }) => {
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);

  useEffect(() => {
    if (!user) return;
    axios.get('http://localhost:8000/api/likes/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(res => {
      const likes = Array.isArray(res.data) ? res.data : res.data.results || [];
      const userLike = likes.find(l => l.blog === blogId);
      setLiked(!!userLike);
      setLikeId(userLike ? userLike.id : null);
    }).catch(() => {
      setLiked(false);
      setLikeId(null);
    });
    // Only update likeCount if not already set from props
    if (typeof initialLikeCount !== 'number') {
      axios.get(`http://localhost:8000/api/blogs/${blogId}/`).then(res => {
        setLikeCount(res.data.liked_by ? res.data.liked_by.length : 0);
      });
    }
  }, [user, blogId, initialLikeCount]);

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await axios.delete(`http://localhost:8000/api/likes/${likeId}/`, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setLiked(false);
      setLikeId(null);
      setLikeCount(likeCount - 1);
    } else {
      try {
        const res = await axios.post('http://localhost:8000/api/likes/', { blog: Number(blogId) }, {
          headers: { Authorization: `Token ${user.token}` },
        });
        setLiked(true);
        setLikeId(res.data.id);
        setLikeCount(likeCount + 1);
      } catch (err) {
        alert(err.response?.data?.blog?.[0] || err.response?.data?.detail || 'Failed to like blog.');
      }
    }
  };

  return (
    <button onClick={handleLike} style={{marginBottom:16, marginLeft:8, display:'flex', alignItems:'center', gap:8}}>
      {liked ? <span role="img" aria-label="Unlike">❤️</span> : <span role="img" aria-label="Like">🤍</span>}
      {liked ? 'Unlike' : 'Like'} ({likeCount})
    </button>
  );
};

export default LikeButton;
