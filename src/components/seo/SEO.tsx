import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  url?: string;
  image?: string;
  canonical?: string;
  schema?: Record<string, any>;
}

export default function SEO({ 
  title, 
  description, 
  name = "SERVIQ", 
  type = "website", 
  url = "https://serviq.com", 
  image = "https://serviq.com/og-image.jpg",
  canonical,
  schema 
}: SEOProps) {
  const fullTitle = `${title} | SERVIQ`;

  // Default Organization Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SERVIQ",
    "url": "https://serviq.com",
    "logo": "https://serviq.com/pwa-512x512.png",
    "description": "Find trusted local professionals for home and personal services."
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      
      {/* Canonical URL */}
      {canonical ? <link rel="canonical" href={canonical} /> : <link rel="canonical" href={url} />}

      {/* Open Graph tags for social media sharing */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={name} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (Schema Markup) */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
}
