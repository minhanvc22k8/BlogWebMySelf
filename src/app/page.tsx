import { getSortedPostsData, PostData } from '@/lib/posts';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function PostCard({ slug, createdAt, title, excerpt }: PostData) {
  const date = createdAt.toDate();

  return (
    <li
      key={slug}
      className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/posts/${slug}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <time dateTime={date.toISOString()} className="text-sm text-gray-500 font-medium">
          {format(date, 'dd MMMM, yyyy', { locale: vi })}
        </time>
      </Link>
    </li>
  );
}

export const revalidate = 60; 

export default async function HomePage() {
  const allPostsData = await getSortedPostsData();

  return (
    <section>
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900">
          Bài viết
        </h1>
        <p className="text-lg text-gray-600">
          Chào mừng đến với blog của tôi. Nơi tôi chia sẻ về hành trình học code và những dự án thú vị.
        </p>
      </div>

      {allPostsData.length > 0 ? (
        <ul className="space-y-8">
          {allPostsData.map(post => (
            <PostCard key={post.slug} {...post} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-10">Chưa có bài viết nào.</p>
      )}
    </section>
  );
}