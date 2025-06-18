import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CommentForm from './CommentForm';
import BookmarkButton from './BookmarkButton';
import LikeButton from './LikeButton';
import FollowButton from './FollowButton';
import { getHtmlFromLexicalState } from './LexicalEditor';

const BlogDetail = ({ user }) => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchBlog = () => {
    axios.get(`http://localhost:8000/api/blogs/${id}/`)
      .then(res => setBlog(res.data));
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/comments/${id}/`, {
        headers: { Authorization: `Token ${user.token}` }
      });
      fetchBlog();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/comments/${id}/`, {
        blog: blog.id,
        content: editContent,
      }, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setEditingCommentId(null);
      setEditContent('');
      fetchBlog();
    } catch (err) {
      alert('Failed to update comment');
    }
  };

  if (!blog) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #2221', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ marginBottom: 8, color: '#181818' }}>{blog.title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          <span style={{ fontWeight: 600, fontSize: 18 }}>{blog.author.username}</span>
          {blog.author.follower_count !== undefined && (
            <span style={{ background: '#f5f5f5', borderRadius: 6, padding: '2px 10px', fontSize: 13, color: '#181818', border: '1px solid #eee', marginTop: 4 }}>
              {blog.author.follower_count} followers
            </span>
          )}
          <FollowButton
            user={user}
            targetUserId={blog.author.id}
            onFollowChange={(didFollow) => {
              setBlog(prev => ({
                ...prev,
                author: {
                  ...prev.author,
                  follower_count: prev.author.follower_count + (didFollow ? 1 : -1),
                }
              }));
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          {blog.category && <span style={{ fontSize: '1em', color: '#ff5e00', marginLeft: 8 }}>Category: {blog.category.name}</span>}
        </div>
      </div>
      <div style={{ width: '100%', margin: '24px 0' }}>
        <div dangerouslySetInnerHTML={{ __html: getHtmlFromLexicalState(blog.content) }} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <BookmarkButton user={user} blogId={blog.id} />
        <LikeButton user={user} blogId={blog.id} likeCount={blog.liked_by ? blog.liked_by.length : 0} />
      </div>
      <h4 style={{ width: '100%', textAlign: 'left', marginTop: 24 }}>Comments</h4>
      {blog.comments.map(c => (
        <div className="comment" key={c.id} style={{ background: '#f1f1f1', borderRadius: 8, padding: '12px 16px', marginBottom: 10, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{c.commenter.username}</span>
            {c.commenter.follower_count !== undefined && (
              <span style={{ background: '#f5f5f5', borderRadius: 6, padding: '2px 10px', fontSize: 12, color: '#181818', border: '1px solid #eee' }}>
                {c.commenter.follower_count} followers
              </span>
            )}
          </div>
          {editingCommentId === c.id ? (
            <>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={2}
                style={{ width: '100%', marginBottom: 8, borderRadius: 6, border: '1px solid #cfd8dc', padding: 8 }}
              />
              <button onClick={() => handleUpdateComment(c.id)} style={{ marginRight: 8 }}>Save</button>
              <button onClick={() => setEditingCommentId(null)}>Cancel</button>
            </>
          ) : (
            <span>{c.content}</span>
          )}
          {user && user.user.id === c.commenter.id && editingCommentId !== c.id && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleEditComment(c)} style={{ marginRight: 8 }}>Edit</button>
              <button onClick={() => handleDeleteComment(c.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
      <CommentForm user={user} blogId={blog.id} onSuccess={fetchBlog} />
    </div>
  );
};

export default BlogDetail;









// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import CommentForm from './CommentForm';
// import BookmarkButton from './BookmarkButton';
// import LikeButton from './LikeButton';
// import FollowButton from './FollowButton';
// import { getHtmlFromLexicalState } from './LexicalEditor';

// const BlogDetail = ({ user }) => {
//   const { id } = useParams();
//   const [blog, setBlog] = useState(null);
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [editContent, setEditContent] = useState('');

//   const fetchBlog = () => {
//     axios.get(`http://localhost:8000/api/blogs/${id}/`)
//       .then(res => setBlog(res.data));
//   };

//   useEffect(() => {
//     fetchBlog();
//   }, [id]);

//   const handleDeleteComment = async (id) => {
//     if (!window.confirm('Delete this comment?')) return;
//     try {
//       await axios.delete(`http://localhost:8000/api/comments/${id}/`, {
//         headers: { Authorization: `Token ${user.token}` }
//       });
//       fetchBlog();
//     } catch (err) {
//       alert('Failed to delete comment');
//     }
//   };

//   const handleEditComment = (comment) => {
//     setEditingCommentId(comment.id);
//     setEditContent(comment.content);
//   };

//   const handleUpdateComment = async (id) => {
//     try {
//       await axios.put(`http://localhost:8000/api/comments/${id}/`, {
//         blog: blog.id,
//         content: editContent,
//       }, {
//         headers: { Authorization: `Token ${user.token}` }
//       });
//       setEditingCommentId(null);
//       setEditContent('');
//       fetchBlog();
//     } catch (err) {
//       alert('Failed to update comment');
//     }
//   };

//   if (!blog) return <div className="container">Loading...</div>;

//   return (
//     <div className="container" style={{maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #2221', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
//       <h2 style={{marginBottom: 8, color: '#181818'}}>{blog.title}</h2>
//       <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
//         <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:120}}>
//           <span style={{fontWeight:600, fontSize:18}}>{blog.author.username}</span>
//           {blog.author.follower_count !== undefined && (
//             <span style={{background:'#f5f5f5', borderRadius:6, padding:'2px 10px', fontSize:13, color:'#181818', border:'1px solid #eee', marginTop:4}}>
//               {blog.author.follower_count} followers
//             </span>
//           )}
//           <FollowButton user={user} targetUserId={blog.author.id} />
//         </div>
//         <div style={{flex:1}}>
//           {blog.category && <span style={{fontSize:'1em', color:'#ff5e00', marginLeft:8}}>Category: {blog.category.name}</span>}
//         </div>
//       </div>
//       <div style={{width:'100%', margin:'24px 0'}}>
//         <div dangerouslySetInnerHTML={{ __html: getHtmlFromLexicalState(blog.content) }} />
//       </div>
//       <div style={{display:'flex', gap:16, marginBottom:24}}>
//         <BookmarkButton user={user} blogId={blog.id} />
//         <LikeButton user={user} blogId={blog.id} likeCount={blog.liked_by ? blog.liked_by.length : 0} />
//       </div>
//       <h4 style={{width:'100%', textAlign:'left', marginTop:24}}>Comments</h4>
//       {blog.comments.map(c => (
//         <div className="comment" key={c.id} style={{background:'#f1f1f1', borderRadius:8, padding:'12px 16px', marginBottom:10, display:'flex', flexDirection:'column'}}>
//           <div style={{display:'flex', alignItems:'center', gap:8}}>
//             <span style={{fontWeight:600}}>{c.commenter.username}</span>
//             {c.commenter.follower_count !== undefined && (
//               <span style={{background:'#f5f5f5', borderRadius:6, padding:'2px 10px', fontSize:12, color:'#181818', border:'1px solid #eee'}}>
//                 {c.commenter.follower_count} followers
//               </span>
//             )}
//           </div>
//           {editingCommentId === c.id ? (
//             <>
//               <textarea
//                 value={editContent}
//                 onChange={e => setEditContent(e.target.value)}
//                 rows={2}
//                 style={{width:'100%', marginBottom:8, borderRadius:6, border:'1px solid #cfd8dc', padding:8}}
//               />
//               <button onClick={() => handleUpdateComment(c.id)} style={{marginRight:8}}>Save</button>
//               <button onClick={() => setEditingCommentId(null)}>Cancel</button>
//             </>
//           ) : (
//             <span>{c.content}</span>
//           )}
//           {user && user.user.id === c.commenter.id && editingCommentId !== c.id && (
//             <div style={{marginTop:8}}>
//               <button onClick={() => handleEditComment(c)} style={{marginRight:8}}>Edit</button>
//               <button onClick={() => handleDeleteComment(c.id)}>Delete</button>
//             </div>
//           )}
//         </div>
//       ))}
//       <CommentForm user={user} blogId={blog.id} onSuccess={fetchBlog} />
//     </div>
//   );
// };

// export default BlogDetail;
