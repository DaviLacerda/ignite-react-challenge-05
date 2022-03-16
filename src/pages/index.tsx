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
}

export default function Home({ postsPagination }: HomeProps) {
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
      let newPosts = await fetch(postsPagination.next_page)
        .then(res => res.json())
        .then(data => data);

      postsPagination.next_page = newPosts.next_page;
      newPosts.results.map(post => {
        setPosts([
          ...posts,
          {
            ...post,
            first_publication_date: formatDate(post.first_publication_date),
          },
        ]);
      });
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
                      <time>{post.first_publication_date}</time>
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
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
