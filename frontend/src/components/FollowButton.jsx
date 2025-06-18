import React, { useState, useEffect } from 'react';

const FollowButton = ({ user, targetUserId, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followId, setFollowId] = useState(null);

    useEffect(() => {
  if (!user || !targetUserId || user.user.id === targetUserId) return;

  const fetchFollows = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/follows/', {
        headers: { Authorization: `Token ${user.token}` }
      });
      const data = await res.json();
      const follows = Array.isArray(data) ? data : data.results || [];
      const found = follows.find(f =>
        (typeof f.following === 'object' ? f.following.id : f.following) === targetUserId
      );
      setIsFollowing(!!found);
      setFollowId(found ? found.id : null);
    } catch (err) {
      console.error("Error fetching follows", err);
      setIsFollowing(false);
      setFollowId(null);
    }
  };

  fetchFollows();
}, [user, targetUserId]);


//   useEffect(() => {
//     if (!user || !targetUserId || user.user.id === targetUserId) return;

//     const fetchFollows = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/api/follows/', {
//           headers: { Authorization: `Token ${user.token}` }
//         });
//         const data = await res.json();
//         const follows = Array.isArray(data) ? data : data.results || [];
//         const found = follows.find(f => f.following.id === targetUserId);
//         setIsFollowing(!!found);
//         setFollowId(found ? found.id : null);
//       } catch (err) {
//         console.error("Error fetching follows", err);
//         setIsFollowing(false);
//         setFollowId(null);
//       }
//     };

//     fetchFollows();
//   }, [user, targetUserId]); // ✅ Removed `loading` dependency

  const handleFollow = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/follows/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${user.token}`
        },
        body: JSON.stringify({ following: Number(targetUserId) })
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(true);
        setFollowId(data.id);
        onFollowChange?.(true);
      } else {
        const errorData = await res.json();
        alert(errorData.following?.[0] || 'Already following or error occurred.');
      }
    } catch (err) {
      alert("Follow failed.");
    }
    setLoading(false);
  };

  const handleUnfollow = async () => {
    if (!user || !followId) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/api/follows/${followId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${user.token}` }
      });
      setIsFollowing(false);
      setFollowId(null);
      onFollowChange?.(false);
    } catch (err) {
      alert("Unfollow failed.");
    }
    setLoading(false);
  };

  if (!user || user.user.id === targetUserId) return null;

  return isFollowing ? (
    <button
      onClick={handleUnfollow}
      disabled={loading}
      style={{
        background: '#fff',
        color: '#181818',
        border: '2px solid #181818',
        borderRadius: 8,
        padding: '8px 18px',
        fontWeight: 500,
        marginLeft: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}
    >
      <span role="img" aria-label="Unfollow">🚫</span>
      {loading ? 'Unfollowing...' : 'Unfollow'}
    </button>
  ) : (
    <button
      onClick={handleFollow}
      disabled={loading}
      style={{
        background: '#181818',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 18px',
        fontWeight: 500,
        marginLeft: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}
    >
      <span role="img" aria-label="Follow">➕</span>
      {loading ? 'Following...' : 'Follow'}
    </button>
  );
};

export default FollowButton;




// import React, { useState, useEffect } from 'react';

// const FollowButton = ({ user, targetUserId, onFollowChange }) => {
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [followId, setFollowId] = useState(null);

//   useEffect(() => {
//     if (!user || !targetUserId || user.user.id === targetUserId) return;
//     fetch('http://localhost:8000/api/follows/', {
//       headers: { Authorization: `Token ${user.token}` }
//     })
//       .then(res => res.json())
//       .then(data => {
//         const follows = Array.isArray(data) ? data : data.results || [];
//         const found = follows.find(f => f.following.id === targetUserId);
//         setIsFollowing(!!found);
//         setFollowId(found ? found.id : null);
//       });
//   }, [user, targetUserId, loading]);

//   const handleFollow = async () => {
//     setLoading(true);
//     const res = await fetch('http://localhost:8000/api/follows/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Token ${user.token}`
//       },
//       body: JSON.stringify({ following: Number(targetUserId) })
//     });
//     if (res.ok) {
//       const data = await res.json();
//       setIsFollowing(true);
//       setFollowId(data.id);
//       onFollowChange?.(true); // Notify parent
//     } else {
//       // Already following? Recheck follow list
//       fetch('http://localhost:8000/api/follows/', {
//         headers: { Authorization: `Token ${user.token}` }
//       })
//         .then(res => res.json())
//         .then(data => {
//           const follows = Array.isArray(data) ? data : data.results || [];
//           const found = follows.find(f => f.following.id === targetUserId);
//           setIsFollowing(!!found);
//           setFollowId(found ? found.id : null);
//         });
//     }
//     setLoading(false);
//   };

//   const handleUnfollow = async () => {
//     if (!followId) return;
//     setLoading(true);
//     await fetch(`http://localhost:8000/api/follows/${followId}/`, {
//       method: 'DELETE',
//       headers: { Authorization: `Token ${user.token}` }
//     });
//     setIsFollowing(false);
//     setFollowId(null);
//     setLoading(false);
//     onFollowChange?.(false); // Notify parent
//   };

//   if (!user || user.user.id === targetUserId) return null;

//   return isFollowing ? (
//     <button onClick={handleUnfollow} disabled={loading} style={{ background: '#fff', color: '#181818', border: '2px solid #181818', borderRadius: 8, padding: '8px 18px', fontWeight: 500, marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
//       <span role="img" aria-label="Unfollow">🚫</span> {loading ? 'Unfollowing...' : 'Unfollow'}
//     </button>
//   ) : (
//     <button onClick={handleFollow} disabled={loading} style={{ background: '#181818', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
//       <span role="img" aria-label="Follow">➕</span> {loading ? 'Following...' : 'Follow'}
//     </button>
//   );
// };

// export default FollowButton;








// import React, { useState, useEffect } from 'react';

// const FollowButton = ({ user, targetUserId }) => {
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [followId, setFollowId] = useState(null);

//   useEffect(() => {
//     if (!user || !targetUserId || user.user.id === targetUserId) return;
//     // Refetch follow state after every follow/unfollow
//     fetch('http://localhost:8000/api/follows/', {
//       headers: { Authorization: `Token ${user.token}` }
//     })
//       .then(res => res.json())
//       .then(data => {
//         const follows = Array.isArray(data) ? data : data.results || [];
//         const found = follows.find(f => f.following.id === targetUserId);
//         setIsFollowing(!!found);
//         setFollowId(found ? found.id : null);
//       });
//   }, [user, targetUserId, loading]); // depend on loading to refetch after follow/unfollow

//   const handleFollow = async () => {
//     setLoading(true);
//     const res = await fetch('http://localhost:8000/api/follows/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Token ${user.token}`
//       },
//       body: JSON.stringify({ following: Number(targetUserId) })
//     });
//     if (res.ok) {
//       const data = await res.json();
//       setIsFollowing(true);
//       setFollowId(data.id);
//     } else {
//       // If already following, find the followId and set state so Unfollow appears
//       fetch('http://localhost:8000/api/follows/', {
//         headers: { Authorization: `Token ${user.token}` }
//       })
//         .then(res => res.json())
//         .then(data => {
//           const follows = Array.isArray(data) ? data : data.results || [];
//           const found = follows.find(f => f.following.id === targetUserId);
//           setIsFollowing(!!found);
//           setFollowId(found ? found.id : null);
//         });
//     }
//     setLoading(false);
//   };

//   const handleUnfollow = async () => {
//     if (!followId) return;
//     setLoading(true);
//     await fetch(`http://localhost:8000/api/follows/${followId}/`, {
//       method: 'DELETE',
//       headers: { Authorization: `Token ${user.token}` }
//     });
//     setIsFollowing(false);
//     setFollowId(null);
//     setLoading(false);
//   };

//   if (!user || user.user.id === targetUserId) return null;

//   return isFollowing ? (
//     <button onClick={handleUnfollow} disabled={loading} style={{background:'#fff', color:'#181818', border:'2px solid #181818', borderRadius:8, padding:'8px 18px', fontWeight:500, marginLeft:12, display:'flex', alignItems:'center', gap:8}}>
//       <span role="img" aria-label="Unfollow">🚫</span> {loading ? 'Unfollowing...' : 'Unfollow'}
//     </button>
//   ) : (
//     <button onClick={handleFollow} disabled={loading} style={{background:'#181818', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:500, marginLeft:12, display:'flex', alignItems:'center', gap:8}}>
//       <span role="img" aria-label="Follow">➕</span> {loading ? 'Following...' : 'Follow'}
//     </button>
//   );
// };

// export default FollowButton;
