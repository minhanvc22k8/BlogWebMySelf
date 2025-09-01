import { getSortedPostsData, PostData } from '@/lib/posts';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Component Card cho mỗi bài viết
function PostCard({ slug, createdAt, title, excerpt }: PostData) {
  // Chuyển đổi timestamp của Firebase thành đối tượng Date
  const date = createdAt.toDate();

  return (
    <li className="post-list-item">
      <Link href={`/posts/${slug}`}>
        <h2>{title}</h2>
        <p>{excerpt}</p>
        <time dateTime={date.toISOString()}>{format(date, 'dd MMMM, yyyy', { locale: vi })}</time>
      </Link>
    </li>
  );
}

// Netlify sẽ tự động làm mới trang này sau mỗi 60 giây
export const revalidate = 60; 

// Component chính của Trang chủ
export default async function HomePage() {
  const allPostsData = await getSortedPostsData();

  return (
    <section>
      <h1 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>Bài viết</h1>
      
      {allPostsData.length > 0 ? (
        <ul>
          {allPostsData.map(post => (
            <PostCard key={post.slug} {...post} />
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', padding: '50px 0' }}>Chưa có bài viết nào.</p>
      )}
    </section>
  );
}
