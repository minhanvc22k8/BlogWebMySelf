'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Định nghĩa kiểu dữ liệu cho một bài viết trong danh sách
interface Post {
  id: string;
  title: string;
}

export default function AdminPage() {
  // State để quản lý trạng thái đăng nhập
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái đăng nhập từ Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Nếu không có người dùng, chuyển hướng về trang đăng nhập
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoadingAuth(false);
    });
    // Dọn dẹp listener khi component không còn được sử dụng
    return () => unsubscribe();
  }, [router]);

  // State để quản lý form và danh sách bài viết
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm lấy danh sách bài viết từ Firestore
  const fetchPosts = async () => {
    const postsCollectionRef = collection(db, 'posts');
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const postsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
    }));
    setPosts(postsList);
  };

  // Chỉ lấy bài viết sau khi đã xác định người dùng đăng nhập
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);
  
  // Hàm tạo slug (URL thân thiện) từ tiêu đề
  const createSlug = (str: string) => {
    str = str.replace(/^\s+|\s+$/g, '').toLowerCase();
    const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;";
    const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------";
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    return str;
  };
  
  // Hàm xử lý khi submit form tạo bài viết mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !excerpt) {
      setError('Vui lòng điền đầy đủ các trường.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const slug = createSlug(title);
      await addDoc(collection(db, 'posts'), {
        title,
        excerpt,
        content,
        slug,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setExcerpt('');
      setContent('');
      alert('Đăng bài thành công!');
      fetchPosts(); // Tải lại danh sách bài viết
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng bài.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi xóa một bài viết
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        try {
            await deleteDoc(doc(db, 'posts', id));
            alert('Xóa bài thành công!');
            fetchPosts(); // Tải lại danh sách bài viết
        } catch (err) {
            alert('Có lỗi xảy ra khi xóa bài.');
            console.error(err);
        }
    }
  };

  if (loadingAuth) {
    return <p>Đang kiểm tra xác thực...</p>;
  }
  if (!user) {
    return null; // Không hiển thị gì trong khi đang chuyển hướng
  }

  return (
    <div>
      <h1>Trang Quản Trị</h1>
      <div className="form-container" style={{ margin: '20px 0' }}>
        <h2>Tạo bài viết mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="excerpt">Mô tả ngắn (Excerpt)</label>
            <input type="text" id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="content">Nội dung (Hỗ trợ Markdown)</label>
            <textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Đang đăng...' : 'Đăng bài'}</button>
        </form>
      </div>
      <div>
        <h2>Danh sách bài viết</h2>
        <ul>
          {posts.map(post => (
            <li key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{post.title}</span>
              <button onClick={() => handleDelete(post.id)} className="button-danger button-small">Xóa</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
