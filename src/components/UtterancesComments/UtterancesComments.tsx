import { useEffect, useRef } from 'react';

export default function UtterancesComments(): JSX.Element {
  const commentsDiv = useRef<HTMLDivElement>();

  useEffect(() => {
    if (commentsDiv) {
      const scriptEl = document.createElement('script');
      scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
      scriptEl.setAttribute('crossorigin', 'anonymous');
      scriptEl.setAttribute('async', 'true');
      scriptEl.setAttribute('repo', 'davilacerda/ignite-react-challenge-05');
      scriptEl.setAttribute('issue-term', 'pathname');
      scriptEl.setAttribute('theme', 'github-dark');
      commentsDiv.current.appendChild(scriptEl);
    }
  }, []);

  return <div ref={commentsDiv} />;
}