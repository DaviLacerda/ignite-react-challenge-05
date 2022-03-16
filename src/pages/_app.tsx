import React from 'react'
import Head from 'next/head'
import '../styles/globals.scss'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp