import './styles/styles.css'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'



export default function MyApp({ Component, pageProps }) {
 
return (
    <>
    <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5YRLPGTNHJ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-5YRLPGTNHJ');
        `}
      </Script>
    <Component {...pageProps} />;
    <Analytics />
    </>
  ) 

}