import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { Metadata } from 'next';

// Định nghĩa kiểu dữ liệu cho props của trang
type Props = {
  params: { slug: string };
};

// Tạo metadata động cho SEO (tiêu đề tab)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const postData = await getPostData(params.slug);
    return { title: postData.title };
  } catch {
    return { title: 'Không tìm thấy bài viết' };
  }
}

export const revalidate = 60;

// Hàm này để Next.js biết cần build những trang nào
export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts;
}

// Hàm lấy dữ liệu cho một trang cụ thể
async function getPost(params: { slug: string }) {
  try {
    const postData = await getPostData(params.slug);
    return postData;
  } catch {
    notFound();
  }
}

// Component chính của trang
export default async function PostPage({ params }: Props) {
  const postData = await getPost(params);
  
  // Chuyển đổi timestamp của Firebase thành đối tượng Date
  const date = postData.createdAt.toDate();

  return (
    <article>
      <header>
        <Link href="/" style={{ marginBottom: '20px', display: 'inline-block' }}>
          &larr; Quay lại trang chủ
        </Link>
        <h1>{postData.title}</h1>
        <time dateTime={date.toISOString()} style={{ color: '#6b7280' }}>
          {format(date, 'dd MMMM, yyyy', { locale: vi })}
        </time>
      </header>
      
      <hr style={{ borderColor: '#e5e7eb', margin: '30px 0' }} />

      <div 
        className="article-content" 
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
      />
    </article>
  );
}