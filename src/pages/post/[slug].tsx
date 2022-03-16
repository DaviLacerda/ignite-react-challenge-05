import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { formatDate } from '../../utils/formatDate';

interface Post {
  first_publication_date: string | null;
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
}

const WORDS_PER_MINUTE = 200;

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readingTime = post.data.content.reduce((sum, content) => {
    const words = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sum + words / WORDS_PER_MINUTE);
  }, 0);

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

        <article className={styles.postContent}>
            {post.data.content.map(content => (
              <section key={content.heading}>
                <h3>{content.heading}</h3>
                <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}/>
              </section>
            ))}
        </article>
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

export const getStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
