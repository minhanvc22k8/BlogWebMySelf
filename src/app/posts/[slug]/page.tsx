import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

export const revalidate = 60;

export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

async function getPost(params: { slug: string }) {
  try {
    const postData = await getPostData(params.slug);
    return postData;
  } catch (error) {
    notFound();
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const postData = await getPost(params);
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