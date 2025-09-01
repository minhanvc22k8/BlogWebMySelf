'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-200 z-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="group">
            <h1 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              My Awesome Blog
            </h1>
            <p className="text-sm text-gray-500">
              Hành trình trở thành Developer
            </p>
          </Link>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                  Quản trị
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium bg-indigo-600 text-white py-1.5 px-3 rounded-md hover:bg-indigo-700"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                  Đăng nhập
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-indigo-600 text-white py-1.5 px-3 rounded-md hover:bg-indigo-700">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 text-gray-800 antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {children}
            </div>
          </main>
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} Tên của bạn. All Rights Reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}