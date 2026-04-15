import { allPosts } from "content-collections";
import Link from "next/link";

export default function Test() {
  return (
    <main>
      <h1>Blog Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path}>
            <Link href={`/posts/${post._meta.path}`}>
              <h2>{post.title}</h2>
            </Link>
            <p>{post.summary}</p>
            <time>{post.date.toLocaleDateString()}</time>
          </li>
        ))}
      </ul>
    </main>
  );
}
