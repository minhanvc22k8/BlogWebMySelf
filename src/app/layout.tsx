'use client';
import './globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// Component Header tách biệt để quản lý trạng thái đăng nhập
function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái đăng nhập từ Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Dọn dẹp listener khi component không còn được sử dụng
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/'); // Quay về trang chủ sau khi đăng xuất
  };

  return (
    <header className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/"><h1>My Awesome Blog</h1></Link>
          <p style={{ margin: 0, color: '#6b7280' }}>Hành trình trở thành Developer</p>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            // Nếu đã đăng nhập
            <>
              <Link href="/admin">Quản trị</Link>
              <button onClick={handleLogout} className="button-small">Đăng xuất</button>
            </>
          ) : (
            // Nếu chưa đăng nhập
            <>
              <Link href="/login">Đăng nhập</Link>
              <Link href="/signup"><button className="button-small">Đăng ký</button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// Layout chính của toàn bộ ứng dụng
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
          <Header />
          <main className="container">
            {children}
          </main>
          <footer>
            <p>&copy; {new Date().getFullYear()} Tên của bạn. All Rights Reserved.</p>
          </footer>
      </body>
    </html>
  );
}