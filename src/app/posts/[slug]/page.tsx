import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 60;

// Định nghĩa kiểu dữ liệu cho props của trang
type Props = {
  params: { slug: string };
};

// Tạo metadata động cho SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const postData = await getPostData(params.slug);
    return {
      title: postData.title,
    };
  } catch {
    return {
      title: 'Không tìm thấy bài viết',
    };
  }
}

// Hàm này để Next.js biết cần build những trang nào
export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

// Lấy dữ liệu cho một trang cụ thể
async function getPost(params: { slug: string }) {
  try {
    const postData = await getPostData(params.slug);
    return postData;
  } catch {
    notFound();
  }
}

// Đây là dòng đã được sửa lại cho đúng chuẩn
export default async function PostPage({ params }: Props) {
  const postData = await getPost(params);
  
  // Chuyển đổi timestamp của Firebase thành đối tượng Date
  const date = postData.createdAt.toDate();

  return (
    <article>
      <header className="mb-8">
        <Link 
          href="/" 
          className="text-blue-600 hover:text-blue-800 transition-colors mb-6 inline-block">
          &larr; Quay lại trang chủ
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
          {postData.title}
        </h1>
        <time dateTime={date.toISOString()} className="text-gray-500">
          {format(date, 'dd MMMM, yyyy', { locale: vi })}
        </time>
      </header>
      
      <div
        className="prose prose-lg max-w-none prose-indigo"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
    </article>
  );
}