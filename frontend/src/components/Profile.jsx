import React, { useState } from 'react';
import axios from 'axios';
import FollowButton from './FollowButton';

const Profile = ({ user }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(user?.user?.profile?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarMsg, setAvatarMsg] = useState('');

  if (!user) return <div className="container"><h2>Please log in to view your profile.</h2></div>;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post('http://localhost:8000/api/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
    }
  };

  const handleAvatarChange = async (e) => {
    setAvatarMsg('');
    const file = e.target.files[0];
    setAvatarFile(file);
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await axios.post('http://localhost:8000/api/avatar-upload/', formData, {
        headers: {
          Authorization: `Token ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatar(res.data.avatar);
      setAvatarMsg('Avatar updated!');
    } catch (err) {
      setAvatarMsg('Failed to upload avatar');
    }
  };

  return (
    <div className="container" style={{maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #2221', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', marginBottom: 18, border: '3px solid #181818', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {avatar ? <img src={avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <span style={{fontSize: 48, color: '#bbb'}}>👤</span>}
      </div>
      <h2 style={{marginBottom: 8, color: '#181818'}}>{user.user.username}</h2>
      <div style={{display:'flex', gap:24, margin:'12px 0'}}>
        <span><strong>Followers:</strong> {user.user.follower_count ?? 0}</span>
        <span><strong>Following:</strong> {user.user.following_count ?? 0}</span>
      </div>
      <p style={{marginBottom: 8}}><strong>Role:</strong> {user.user.is_superuser ? 'Writer' : 'Reader'}</p>
      <FollowButton user={user} targetUserId={user.user.id} />
      <div style={{width:'100%', margin:'32px 0'}}>
        <form onSubmit={handlePasswordChange} style={{marginBottom: 24}}>
          <h4 style={{marginBottom: 12}}>Change Password</h4>
          <input
            type="password"
            placeholder="Current Password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Change Password</button>
          {message && <div className="success" style={{color:'#388e3c', marginTop:8}}>{message}</div>}
          {error && <div className="error">{error}</div>}
        </form>
        <div style={{marginBottom: 24}}>
          <h4 style={{marginBottom: 12}}>Change Avatar</h4>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarMsg && <div style={{marginTop:8, color: avatarMsg.includes('updated') ? '#388e3c' : '#d32f2f'}}>{avatarMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
