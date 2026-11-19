import Script from "next/script";

export const GTM_ID = "GTM-TTCJC8PQ";

/**
 * Google Tag Manager cu Consent Mode v2.
 * Implicit: analytics și ads refuzate până la accept (GDPR, cerință Google pentru SEE).
 * Alegerea se păstrează în localStorage "lunar-consent" = "granted" | "denied".
 */
export default function Gtm() {
  return (
    <>
      <Script id="gtm-consent" strategy="beforeInteractive">{`
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
var c=null;try{c=localStorage.getItem('lunar-consent')}catch(e){}
var g=c==='granted'?'granted':'denied';
gtag('consent','default',{ad_storage:g,analytics_storage:g,ad_user_data:g,ad_personalization:g,functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);
`}</Script>
      <Script id="gtm" strategy="afterInteractive">{`
if(!location.pathname.startsWith('/admin')){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');}
`}</Script>
    </>
  );
}

export function GtmNoScript() {
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
    </noscript>
  );
}
