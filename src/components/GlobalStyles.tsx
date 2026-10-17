import { C, FONT } from '../theme';

const css = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body,#root{margin:0;padding:0;min-height:100%}
body{font-family:${FONT};color:${C.text};background:${C.bg};-webkit-font-smoothing:antialiased}
button,input,select,textarea{font-family:inherit;font-size:inherit;color:inherit}
button{cursor:pointer;border:none;background:none;padding:0}
a{color:inherit;text-decoration:none}
::selection{background:${C.accent};color:${C.primaryDark}}
.hide-scroll{scrollbar-width:none}
.hide-scroll::-webkit-scrollbar{display:none}
input:focus,select:focus,textarea:focus{outline:2px solid ${C.primarySoft};outline-offset:0;border-color:${C.primarySoft}!important}
.tap{transition:transform .18s ease,box-shadow .18s ease}
.tap:active{transform:scale(.95)}
.lift{transition:transform .25s ease,box-shadow .25s ease}
.lift:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(11,74,67,.14)}
.row-hover{transition:background .15s ease}
.row-hover:hover{background:${C.tint2}}

@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{transform:translateX(-100%)}to{transform:none}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:none}}
@keyframes float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-16px) rotate(3deg)}}
@keyframes floatSoft{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-26px) scale(1.15)}66%{transform:translate(-14px,12px) scale(.92)}}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(246,196,69,.65)}70%{box-shadow:0 0 0 16px rgba(246,196,69,0)}100%{box-shadow:0 0 0 0 rgba(246,196,69,0)}}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes sheen{0%{transform:translateX(-120%) skewX(-20deg)}60%,100%{transform:translateX(220%) skewX(-20deg)}}
@keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}
@keyframes bounceIn{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes confetti{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(260px) rotate(540deg);opacity:0}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}
@keyframes tilt3d{0%,100%{transform:perspective(700px) rotateY(-12deg) rotateX(4deg)}50%{transform:perspective(700px) rotateY(12deg) rotateX(-2deg)}}

html,body{overflow-x:hidden;width:100%;max-width:100%}

@media (min-width: 1024px) {
  .site-desktop-sidebar { display: flex !important; }
  .site-desktop-header { display: flex !important; }
  .site-mobile-header { display: none !important; }
  .site-mobile-bottom-nav { display: none !important; }
  .desktop-hide { display: none !important; }
  .hero-wrapper { margin: 20px 24px 0 !important; padding: 44px 36px 48px !important; border-radius: 28px !important; }
  .hero-grid { display: grid !important; grid-template-columns: 1.15fr 0.85fr !important; gap: 36px !important; align-items: center !important; }
  .hero-title { font-size: 46px !important; line-height: 1.1 !important; letter-spacing: -1.2px !important; }
  .product-detail-grid { display: grid !important; grid-template-columns: 1fr 1.15fr !important; gap: 36px !important; align-items: start !important; }
  .cart-grid { display: grid !important; grid-template-columns: 1.5fr 1fr !important; gap: 28px !important; align-items: start !important; }
  .checkout-grid { display: grid !important; grid-template-columns: 1.4fr 1fr !important; gap: 28px !important; align-items: start !important; }
  .site-page-container { padding: 24px 28px 50px !important; }
  .product-cards-grid { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important; gap: 20px !important; }
  .desktop-footer { padding: 48px 36px 24px !important; }
}

@media (max-width: 1023px) {
  .site-desktop-sidebar { display: none !important; }
  .site-desktop-header { display: none !important; }
  .site-mobile-header { display: flex !important; }
  .site-mobile-bottom-nav { display: flex !important; }
  .mobile-hide { display: none !important; }
  .hero-wrapper { margin: 10px 10px 0 !important; padding: 24px 14px 20px !important; border-radius: 20px !important; }
  .hero-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .hero-title { font-size: 26px !important; line-height: 1.2 !important; letter-spacing: -0.5px !important; }
  .hero-badges-row { flex-wrap: wrap !important; gap: 8px 12px !important; font-size: 11.5px !important; }
  .product-detail-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .cart-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .checkout-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .site-page-container { padding: 14px 12px 84px !important; }
  .product-cards-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
  .brand-ticker-head { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; font-size: 11px !important; }
  .flash-deal-box { padding: 16px 12px !important; margin: 18px 0 0 !important; border-radius: 18px !important; }
  .desktop-footer { padding: 28px 16px 88px !important; }
}
`;

export default function GlobalStyles() {
  return <style>{css}</style>;
}
