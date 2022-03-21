import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';

import { useRouter } from 'next/router';

import UtterancesComments from '../../components/UtterancesComments/UtterancesComments';

import { formatDate } from '../../utils/formatDate';
import { formatDateWithHour } from '../../utils/formatDateWithHour';
import Link from 'next/link';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevAndNextPosts: {
    prev: Post;
    next: Post;
  },
  preview: boolean
}

const WORDS_PER_MINUTE = 200;

export default function Post({ post, prevAndNextPosts, preview }: PostProps) {
  const router = useRouter();
  let last_publication_date = null;

  const readingTime = post.data.content.reduce((sum, content) => {
    const words = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sum + words / WORDS_PER_MINUTE);
  }, 0);

  if(post.last_publication_date !== post.first_publication_date){
    last_publication_date = formatDateWithHour(post.last_publication_date)
  }

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Header />
      <img src={post.data.banner.url} className={styles.banner} />
      <main className={`${commonStyles.container} ${styles.content}`}>
        <header>
          <h1>{post.data.title}</h1>
          {
            post.data.subtitle && <h2>{post.data.subtitle}</h2>
          }
        </header>

        <div className={commonStyles.info}>
          <div>
            <FiCalendar />
            <time>{formatDate(post.first_publication_date)}</time>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <time>{readingTime} min</time>
          </div>
        </div>

        {
          last_publication_date !== null && 
          <span className={styles.edited}>
            {`* editado em ${last_publication_date.date}, às ${last_publication_date.hour}`}
          </span>
        }

        <article>
            {post.data.content.map(content => (
              <section key={content.heading}>
                <h3>{content.heading}</h3>
                <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}/>
              </section>
            ))}
        </article>

        <div className={styles.redirectPosts}>
          <div>
              {
                prevAndNextPosts.prev.data && (
                  <div>
                    <span>{prevAndNextPosts.prev.data.title}</span>
                    <Link href={`/post/${prevAndNextPosts.prev.uid}`}>
                      <a className={commonStyles.highlight}>
                        Post anterior
                      </a>
                    </Link>
                  </div>
                )
              }
          </div>
          <div>
            {
                prevAndNextPosts.next.data && (
                  <>
                    <span>{prevAndNextPosts.next.data.title}</span>
                    <Link href={`/post/${prevAndNextPosts.next.uid}`}>
                      <a className={commonStyles.highlight}>
                        Próximo post
                      </a>
                    </Link>
                  </>
                )
              }
          </div>
        </div>

        <UtterancesComments />

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

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  let staticPosts = posts.results.map(slug => slug.uid);

  return {
    paths: staticPosts.map(slug => {
      return {
        params: { slug },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps = async ({ preview = false , previewData, params}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref:previewData?.ref || null
  });

  const { results: prevPost } = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  )

  const { results: nextPost } = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  )
  
  const prevAndNextPosts = {
    prev: {...prevPost[0]},
    next: {...nextPost[0]}
  }
  
  return {
    props: {
      post: response,
      prevAndNextPosts,
      preview
    },
  };
};
