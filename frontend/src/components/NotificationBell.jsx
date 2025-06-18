import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef();

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const res = await fetch('http://localhost:8000/api/notifications/', {
        headers: { Authorization: `Token ${user.token}` }
      });
      const data = await res.json();
      const notifications = Array.isArray(data) ? data : data.results || [];
      setNotifications(notifications);
      setUnread(notifications.filter(n => !n.is_read).length);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Mark all as read when dropdown opens
  const handleOpen = async () => {
    setOpen(!open);
    if (!open && notifications.some(n => !n.is_read)) {
      await Promise.all(
        notifications.filter(n => !n.is_read).map(n =>
          fetch(`http://localhost:8000/api/notifications/${n.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${user.token}`
            },
            body: JSON.stringify({ is_read: true })
          })
        )
      );
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div ref={bellRef} style={{ position: 'relative', display: 'inline-block', marginLeft: 18 }}>
      <button onClick={handleOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
        <span style={{ fontSize: 22, color: '#fff' }} role="img" aria-label="Notifications">🔔</span>
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff5e00', color: '#fff', borderRadius: '50%', fontSize: 12, padding: '2px 6px', fontWeight: 700 }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 36, background: '#fff', color: '#181818', minWidth: 320, boxShadow: '0 2px 12px #2222', borderRadius: 10, zIndex: 100, maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1.5px solid #eee', fontWeight: 600 }}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ padding: 18, color: '#888' }}>No notifications yet.</div>
          ) : notifications.map(n => (
            <div key={n.id} style={{ padding: '12px 18px', borderBottom: '1px solid #f3f3f3', background: n.is_read ? '#fff' : '#fff7f0' }}>
              <span style={{ fontWeight: n.is_read ? 400 : 600 }}>{n.message}</span>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</div>
              {n.blog && <Link to={`/blog/${n.blog.id}`} style={{ color: '#ff5e00', fontSize: 13, marginLeft: 8 }}>View Blog</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
