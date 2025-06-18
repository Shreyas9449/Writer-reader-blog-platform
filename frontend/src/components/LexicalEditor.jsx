import React, { useCallback, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $getSelection } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import './LexicalEditor.css';

const theme = {
  // Add custom theme styles if needed
};

function Placeholder() {
  return <div className="editor-placeholder">Enter content...</div>;
}

// Helper to check if value is valid Lexical JSON
function isValidLexicalState(val) {
  if (!val) return false;
  try {
    const parsed = JSON.parse(val);
    return parsed && typeof parsed === 'object' && parsed.root;
  } catch {
    return false;
  }
}

// Helper to convert Lexical JSON to HTML
export function getHtmlFromLexicalState(val) {
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === 'object' && parsed.root) {
      return parsed.root.children.map(child => {
        if (child.type === 'image') {
          let src = child.src || '';
          if (src && !src.startsWith('http') && !src.startsWith('/media/')) {
            src = `http://localhost:8000${src.startsWith('/') ? '' : '/'}${src}`;
          } else if (src && src.startsWith('/media/')) {
            src = `http://localhost:8000${src}`;
          }
          return `<img src="${src}" alt="${child.alt || ''}" style="max-width:100%;margin:12px 0;border-radius:8px;" />`;
        } else if (child.type === 'paragraph') {
          // Render paragraph children (text, etc)
          const inner = (child.children || []).map(grand => grand.text || '').join('');
          return `<p>${inner}</p>`;
        } else if (child.text) {
          return `<span>${child.text}</span>`;
        }
        return '';
      }).join('');
    }
  } catch {}
  return '';
}

export default function LexicalEditor({ value, onChange }) {
  const fileInputRef = useRef();

  const initialConfig = {
    namespace: 'BlogEditor',
    theme,
    onError(error) {
      throw error;
    },
    editorState: isValidLexicalState(value) ? value : undefined,
  };

  const handleChange = useCallback((editorState, editor) => {
    // Save as Lexical JSON string
    editor.update(() => {
      const state = editor.getEditorState();
      const json = JSON.stringify(state.toJSON());
      onChange && onChange(json);
    });
  }, [onChange]);

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    // Get token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    try {
      const res = await fetch('http://localhost:8000/api/image-upload/', {
        method: 'POST',
        headers: token ? { Authorization: `Token ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        // Insert image as HTML <img> tag (Lexical image plugin can be added for richer support)
        onChange && onChange(JSON.stringify({
          ...JSON.parse(value || '{"root":{"children":[],"type":"root","format":""}}'),
          root: {
            ...JSON.parse(value || '{"root":{"children":[],"type":"root","format":""}}').root,
            children: [
              ...(JSON.parse(value || '{"root":{"children":[],"type":"root","format":""}}').root.children || []),
              { type: 'image', src: data.url, alt: file.name }
            ]
          }
        }));
      }
    } catch (err) {
      alert('Image upload failed');
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
          <button type="button" onClick={() => fileInputRef.current.click()} style={{background:'#181818', color:'#fff', border:'none', borderRadius:6, padding:'6px 18px', fontSize:'0.98em'}}>Insert Image</button>
          <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={handleImageUpload} />
        </div>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder />}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
