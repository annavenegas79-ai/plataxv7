import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
  titleTemplate: '%s | PlataMX',
  defaultTitle: 'PlataMX - La mejor plataforma de compra y venta en México',
  description: 'Compra y vende productos en PlataMX. Encuentra las mejores ofertas en electrónica, moda, hogar y más. Envíos a todo México.',
  canonical: 'https://www.platamx.com',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.platamx.com',
    siteName: 'PlataMX',
    title: 'PlataMX - La mejor plataforma de compra y venta en México',
    description: 'Compra y vende productos en PlataMX. Encuentra las mejores ofertas en electrónica, moda, hogar y más. Envíos a todo México.',
    images: [
      {
        url: 'https://www.platamx.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PlataMX',
      },
    ],
  },
  twitter: {
    handle: '@platamx',
    site: '@platamx',
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
  additionalMetaTags: [
    {
      name: 'application-name',
      content: 'PlataMX',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'PlataMX',
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'theme-color',
      content: '#2D3277',
    },
  ],
};

export default SEO;