import { C, FONT } from '../theme';

const css = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;overflow-wrap:break-word}
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
.marquee-track{display:flex;width:max-content;will-change:transform}
.marquee-wrap:hover .marquee-track{animation-play-state:paused}
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

html,body{overflow-x:clip;width:100%;max-width:100%}

@media (min-width: 1024px) {
  .site-desktop-sidebar { display: flex !important; }
  .site-desktop-header { display: flex !important; position: sticky !important; top: 0 !important; z-index: 100 !important; }
  .site-mobile-header { display: none !important; }
  .site-mobile-bottom-nav { display: none !important; }
  .desktop-hide { display: none !important; }
  .hero-wrapper { max-width: 1360px !important; margin: 24px auto 0 !important; padding: 44px 40px 48px !important; border-radius: 28px !important; }
  .hero-inner-container { display: grid !important; grid-template-columns: 1.15fr 0.85fr !important; gap: 36px !important; align-items: center !important; }
  .hero-content-col { max-width: 100% !important; }
  .hero-phones-img-wrapper { position: relative !important; right: auto !important; bottom: auto !important; width: 100% !important; max-width: 480px !important; }
  .hero-title { font-size: 46px !important; line-height: 1.1 !important; letter-spacing: -1.2px !important; }
  .product-detail-grid { display: grid !important; grid-template-columns: 1fr 1.15fr !important; gap: 36px !important; align-items: start !important; }
  .cart-grid { display: grid !important; grid-template-columns: 1.5fr 1fr !important; gap: 28px !important; align-items: start !important; }
  .checkout-grid { display: grid !important; grid-template-columns: 1.4fr 1fr !important; gap: 28px !important; align-items: start !important; }
  .site-page-container { padding: 24px 28px 50px !important; }
  .product-cards-grid { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important; gap: 20px !important; align-items: stretch !important; }
  .product-cards-grid > * { height: 100% !important; display: flex !important; }
  .product-cards-grid .product-card-item { width: 100% !important; height: 100% !important; }
  .categories-grid { display: grid !important; grid-template-columns: repeat(6, 1fr) !important; gap: 14px !important; align-items: stretch !important; }
  .categories-grid > * { height: 100% !important; display: flex !important; }
  .categories-grid .category-box-card { width: 100% !important; height: 100% !important; min-height: 154px !important; box-sizing: border-box !important; }
  .desktop-footer { padding: 48px 36px 24px !important; }
}

@media (max-width: 1023px) {
  .site-desktop-sidebar { display: none !important; }
  .site-desktop-top-bar { display: none !important; }
  .site-desktop-navbar { display: none !important; }
  .site-desktop-header { display: none !important; }
  .site-mobile-header { display: flex !important; position: sticky !important; top: 0 !important; z-index: 100 !important; }
  .site-mobile-bottom-nav { display: none !important; }
  .mobile-hide { display: none !important; }
  .hero-wrapper { margin: 10px 8px 0 !important; padding: 22px 14px 18px !important; border-radius: 20px !important; overflow: hidden !important; position: relative !important; }
  .hero-inner-container { position: relative !important; min-height: 215px !important; }
  .hero-content-col { width: 100% !important; max-width: 100% !important; position: relative !important; z-index: 2 !important; }
  .hero-main-title { font-size: 24px !important; line-height: 1.18 !important; max-width: 68% !important; letter-spacing: -0.5px !important; }
  .hero-actions-row { display: flex !important; flex-direction: row !important; gap: 8px !important; flex-wrap: nowrap !important; margin-top: 14px !important; position: relative !important; z-index: 3 !important; }
  .hero-actions-row .hero-btn { flex: 1 1 50% !important; min-width: 0 !important; padding: 7px 4px !important; font-size: 9px !important; font-weight: 800 !important; letter-spacing: -0.15px !important; border-radius: 8px !important; text-align: center !important; }
  .hero-phones-img-wrapper { position: absolute !important; right: -8px !important; top: 8px !important; bottom: auto !important; width: clamp(170px, 46vw, 300px) !important; z-index: 1 !important; pointer-events: none !important; animation: none !important; transform: none !important; }
  .hero-badges-row { display: flex !important; flex-wrap: wrap !important; gap: 4px 8px !important; font-size: 10.5px !important; margin-top: 12px !important; position: relative !important; z-index: 3 !important; }
  .stats-band-box { grid-template-columns: repeat(2, 1fr) !important; gap: 16px 10px !important; padding: 20px 14px !important; border-radius: 20px !important; margin-top: 24px !important; }
  .categories-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; align-items: stretch !important; }
  .categories-grid > * { height: 100% !important; display: flex !important; }
  .categories-grid .category-box-card { width: 100% !important; height: 100% !important; min-height: 154px !important; box-sizing: border-box !important; }
  .spotlight-card { padding: 22px 16px !important; grid-template-columns: 1fr !important; gap: 20px !important; border-radius: 22px !important; }
  .trust-shield-card { padding: 22px 14px !important; margin-top: 24px !important; border-radius: 20px !important; }
  .newsletter-card { padding: 22px 16px !important; border-radius: 20px !important; }
  .product-detail-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .cart-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .checkout-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
  .site-page-container { padding: 12px 8px 32px !important; }
  .product-cards-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; align-items: stretch !important; }
  .product-cards-grid > * { height: 100% !important; display: flex !important; }
  .product-cards-grid .product-card-item { width: 100% !important; height: 100% !important; }
  .brand-ticker-head { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; font-size: 11px !important; }
  .flash-deal-box { padding: 16px 12px !important; margin: 18px 0 0 !important; border-radius: 18px !important; }
  .desktop-footer { padding: 28px 16px 36px !important; }
  .service-booking-card { padding: 20px 14px !important; border-radius: 20px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; overflow: hidden !important; }
  .service-form-row { display: grid !important; grid-template-columns: 1fr !important; gap: 10px !important; width: 100% !important; box-sizing: border-box !important; }
}

.service-booking-card { width: 100%; max-width: 100%; box-sizing: border-box; }
.service-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; box-sizing: border-box; }
@media (max-width: 560px) {
  .service-form-row { grid-template-columns: 1fr !important; gap: 10px !important; }
}

/* ==================== ADMIN PANEL COMPLETE MOBILE RESPONSIVENESS ==================== */
.admin-root-container {
  display: flex;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  background: ${C.bg};
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
}

.admin-sidebar {
  width: 252px;
  background: ${C.primary};
  color: #fff;
  padding: 22px 14px;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  flex-shrink: 0;
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
}

.admin-main-content {
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

.admin-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${C.border};
  padding: 12px 28px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.admin-page-body {
  padding: 24px 28px 40px;
  max-width: 1500px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.admin-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.admin-split-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
  align-items: start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.admin-split-grid > * {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.admin-split-orders {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 16px;
  align-items: start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.admin-split-orders > * {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.admin-split-inventory {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  align-items: start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.admin-split-inventory > * {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.admin-kanban-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  align-items: start;
}

.admin-telemetry-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 14px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid ${C.border};
  margin-bottom: 18px;
}

.admin-table-scroll {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
  scroll-behavior: smooth;
  position: relative;
  scrollbar-width: auto;
  scrollbar-color: #0b4a43 #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 4px;
}

/* Prominent, always visible horizontal scrollbar for Chromium / WebKit */
.admin-table-scroll::-webkit-scrollbar {
  height: 9px !important;
  width: 9px !important;
  display: block !important;
  -webkit-appearance: none !important;
}

.admin-table-scroll::-webkit-scrollbar-track {
  background: #f1f5f9 !important;
  border-radius: 99px !important;
  border: 1px solid #e2e8f0 !important;
  margin: 0 4px !important;
}

.admin-table-scroll::-webkit-scrollbar-thumb {
  background: #0b4a43 !important;
  border-radius: 99px !important;
  border: 2px solid #f1f5f9 !important;
}

.admin-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #07332e !important;
}

.admin-table-scroll table {
  width: 100%;
  table-layout: auto;
}

.admin-scroll-hint {
  display: none !important;
}

@media (max-width: 1100px) {
  .admin-scroll-hint {
    display: none !important;
  }
}

.admin-mobile-only {
  display: none !important;
}

.admin-desktop-only {
  display: flex !important;
}

/* Admin form grid (used inside modals / product form) */
.admin-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 960px) {
  .admin-mobile-only {
    display: flex !important;
  }
  .admin-desktop-only {
    display: none !important;
  }
  .admin-sidebar {
    position: fixed !important;
    top: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    height: 100vh !important;
    height: 100dvh !important;
    width: 280px !important;
    max-width: 85vw !important;
    transform: translateX(-105%) !important;
    box-shadow: 0 0 40px rgba(0,0,0,0.5) !important;
    z-index: 1000 !important;
  }
  .admin-sidebar.admin-sidebar-open {
    transform: translateX(0) !important;
  }
  .admin-header {
    padding: 10px 10px !important;
    gap: 8px !important;
    justify-content: space-between !important;
  }
  .service-desk-mobile-hide {
    display: none !important;
  }
  .admin-page-body {
    padding: 12px 10px 36px !important;
    overflow-x: hidden !important;
  }
  .admin-kpi-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
    margin-bottom: 14px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  /* Force KPI cards to not overflow */
  .admin-kpi-grid > * {
    min-width: 0 !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .admin-split-grid,
  .admin-split-orders,
  .admin-split-inventory {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
  .admin-split-grid > *,
  .admin-split-orders > *,
  .admin-split-inventory > * {
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .admin-split-orders > div:last-child {
    position: static !important;
  }
  .admin-kanban-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  .admin-telemetry-bar {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px 10px !important;
    padding: 12px !important;
  }
  /* Remove border-right on telemetry items (they don't make sense on mobile when stacked) */
  .admin-telemetry-bar > div {
    border-right: none !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* Table scrolling: ensure smooth horizontal touch scrolling with visible scrollbar */
  .admin-table-scroll {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-x pan-y !important;
    scrollbar-width: thin !important;
    scrollbar-color: #0b4a43 #e2e8f0 !important;
    padding-bottom: 8px !important;
    box-sizing: border-box !important;
  }
  .admin-table-scroll::-webkit-scrollbar {
    height: 7px !important;
    display: block !important;
    -webkit-appearance: none !important;
  }
  .admin-table-scroll::-webkit-scrollbar-track {
    background: #e2e8f0 !important;
    border-radius: 99px !important;
  }
  .admin-table-scroll::-webkit-scrollbar-thumb {
    background: #0b4a43 !important;
    border-radius: 99px !important;
  }
  .admin-scroll-hint {
    display: none !important;
  }
  .admin-table-scroll table {
    min-width: 600px !important;
  }
  /* Ensure panels don't overflow */
  .admin-page-body > div {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  /* Panels should not overflow */
  .admin-page-body [style*="borderRadius"] {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Admin form grids should stack on mobile */
  .admin-form-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  /* Settings page grids - force stack on mobile */
  .admin-page-body [style*="repeat(auto-fit"] {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 560px) {
  .admin-kpi-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
    margin-bottom: 12px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .admin-kpi-grid > * {
    min-width: 0 !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .admin-telemetry-bar {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
    padding: 10px 8px !important;
    box-sizing: border-box !important;
  }
  .admin-page-body {
    padding: 10px 8px 32px !important;
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .admin-header {
    padding: 8px 8px !important;
    gap: 6px !important;
  }
  /* Kanban cards: tighter padding */
  .admin-kanban-grid > div {
    padding: 10px !important;
  }
}
`;

export default function GlobalStyles() {
  return <style>{css}</style>;
}
