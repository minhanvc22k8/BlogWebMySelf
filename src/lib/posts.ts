import { db } from './firebase';
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { remark } from 'remark';
import html from 'remark-html';

// Định nghĩa kiểu dữ liệu cho bài viết từ Firestore
export interface PostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: Timestamp;
}

export interface PostContent {
  slug: string;
  title: string;
  contentHtml: string;
  createdAt: Timestamp;
}

// Lấy tất cả bài viết để hiển thị ở trang chủ
export async function getSortedPostsData(): Promise<PostData[]> {
  const postsCollectionRef = collection(db, 'posts');
  const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PostData));
}

// Lấy tất cả slug để Next.js biết cần build những trang nào
export async function getAllPostSlugs() {
  const posts = await getSortedPostsData();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Lấy dữ liệu của một bài viết cụ thể dựa vào slug
export async function getPostData(slug: string): Promise<PostContent> {
  const postsCollectionRef = collection(db, 'posts');
  const q = query(postsCollectionRef, where('slug', '==', slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Post not found');
  }

  const postDoc = querySnapshot.docs[0];
  const postData = postDoc.data() as PostData;

  // Dùng remark để chuyển đổi markdown thành HTML
  const processedContent = await remark()
    .use(html)
    .process(postData.content);
  const contentHtml = processedContent.toString();

  return {
    ...postData,
    contentHtml,
  };
}