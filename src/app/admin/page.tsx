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
  // === PHẦN MỚI: XÁC THỰC NGƯỜI DÙNG ===
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái đăng nhập
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Người dùng đã đăng nhập
        setUser(currentUser);
      } else {
        // Người dùng chưa đăng nhập, chuyển hướng về trang login
        router.push('/login');
      }
      setLoadingAuth(false);
    });

    // Dọn dẹp listener khi component bị unmount
    return () => unsubscribe();
  }, [router]);


  // === PHẦN CŨ: QUẢN LÝ BÀI VIẾT (GIỮ NGUYÊN) ===
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Chỉ fetch bài viết sau khi đã xác định người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const createSlug = (str: string) => {
    str = str.replace(/^\s+|\s+$/g, '');
    str = str.toLowerCase();
    const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;";
    const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------";
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    return str;
  };

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
      fetchPosts();
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng bài.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        try {
            await deleteDoc(doc(db, 'posts', id));
            alert('Xóa bài thành công!');
            fetchPosts();
        } catch (err) {
            alert('Có lỗi xảy ra khi xóa bài.');
            console.error(err);
        }
    }
  };

  // === PHẦN MỚI: HIỂN THỊ DỰA TRÊN TRẠNG THÁI ĐĂNG NHẬP ===
  if (loadingAuth) {
    return <p className="text-center mt-20">Đang kiểm tra xác thực...</p>;
  }

  // Nếu không có user, component sẽ không render gì cả (vì đã bị chuyển hướng)
  if (!user) {
    return null;
  }

  // === PHẦN CŨ: GIAO DIỆN (GIỮ NGUYÊN) ===
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Trang Quản Trị</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tạo bài viết mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Mô tả ngắn (Excerpt)</label>
            <input
              type="text"
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung (Hỗ trợ Markdown)</label>
            <textarea
              id="content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Danh sách bài viết</h2>
        <ul className="space-y-3">
            {posts.map(post => (
                <li key={post.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-gray-800">{post.title}</span>
                    <button 
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-500 text-white text-sm py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Xóa
                    </button>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

