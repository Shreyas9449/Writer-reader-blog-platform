import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookmarkButton = ({ user, blogId }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);

  useEffect(() => {
    if (!user) return;
    axios.get('http://localhost:8000/api/bookmarks/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(res => {
      const bookmarks = Array.isArray(res.data) ? res.data : res.data.results || [];
      const found = bookmarks.find(b => b.blog === blogId);
      if (found) {
        setBookmarked(true);
        setBookmarkId(found.id);
      } else {
        setBookmarked(false);
        setBookmarkId(null);
      }
    });
  }, [user, blogId]);

  const handleBookmark = async () => {
    if (!user) return;
    if (bookmarked) {
      await axios.delete(`http://localhost:8000/api/bookmarks/${bookmarkId}/`, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setBookmarked(false);
      setBookmarkId(null);
    } else {
      const res = await axios.post('http://localhost:8000/api/bookmarks/', { blog: blogId }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setBookmarked(true);
      setBookmarkId(res.data.id);
    }
  };

  if (!user) return null;

  return (
    <button onClick={handleBookmark} style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
      {bookmarked ? <span role="img" aria-label="Bookmarked">🔖</span> : <span role="img" aria-label="Bookmark">📑</span>}
      {bookmarked ? 'Remove Bookmark' : 'Bookmark'}
    </button>
  );
};

export default BookmarkButton;
