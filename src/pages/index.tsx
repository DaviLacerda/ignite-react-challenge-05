import { GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';

import { useState } from 'react';
import { formatDate } from '../utils/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState(
    postsPagination.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: formatDate(post.first_publication_date),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    })
  );
    
  const handlePosts = async () => {
    if (postsPagination.next_page !== null) {
      let response = await fetch(postsPagination.next_page)
        .then(res => res.json())
        .then(data => data);

      let newPosts = response.results.map((post): Post => {
        return post;
      });

      postsPagination.next_page = response.next_page;
      setPosts([...posts, ...newPosts]);
    }
  };

  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map((post: Post) => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <div key={post.uid} className={styles.post}>
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>

                  <div className={commonStyles.info}>
                    <div>
                      <FiCalendar />
                      <time>{formatDate(post.first_publication_date)}</time>
                    </div>

                    <div>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {postsPagination.next_page && (
          <button
            type="button"
            onClick={handlePosts}
            className={styles.highlight}
          >
            Carregar mais posts
          </button>
        )}
        {preview && (
          <aside className={commonStyles.preview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps = async ({ preview = false, previewData }) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
      orderings: '[document.first_publication_date desc]',
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
      preview
    },
  };
};
