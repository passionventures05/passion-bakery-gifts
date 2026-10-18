"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import BorderDivider from "@/components/BorderDivider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  FILTER_OPTIONS,
  GIFT_TYPES,
  leadTimeHoursFor,
  typeById,
  typeOfProduct,
  PRODUCTS_PER_PAGE,
  getCachedProducts,
  getCategoryTag,
  normalizeCategory,
  setCachedProducts,
} from "@/lib/products";
import { openWhatsApp } from "@/lib/external";
import { site } from "@/lib/site";
import { useCart } from "@/lib/useCart";
import type { CartItem, Product, SizeOption } from "@/types";
import ProductCard from "./ProductCard";
import MiniCart from "./MiniCart";
import PincodeCheck from "./PincodeCheck";
import ProductModal from "./ProductModal";
import { useNotification } from "./useNotification";
import "@/styles/products.css";
import "@/styles/luxe-products.css";
import "@/styles/royal.css";

type Status = "loading" | "ready" | "error";

export default function ProductsView() {
  const { cart, setItem } = useCart();
  const { notify, element: notification } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [typeId, setTypeId] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollOnPage = useRef(false);

  const load = useCallback(async () => {
    const cached = getCachedProducts();
    if (cached && cached.length > 0) {
      setProducts(cached);
      setStatus("ready");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch("/gift_products.json");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Product[] = await response.json();
      setCachedProducts(data);
      setProducts(data);
      setStatus("ready");
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // /products/?type=candles opens straight on that product type (static export: read from the URL)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    if (t && typeById(t)) setTypeId(t);
  }, []);

  const chooseType = (id: string) => {
    setTypeId(id);
    setTag("");
    try {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("type", id);
      else url.searchParams.delete("type");
      window.history.replaceState(null, "", url);
    } catch {}
  };

  // 250ms search debounce
  useEffect(() => {
    const id = window.setTimeout(() => setTerm(search.toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  // filter / search change -> back to page 1
  useEffect(() => {
    setPage(1);
  }, [typeId, tag, term]);

  const filtered = useMemo(
    () =>
      products
        .filter((p) => p.name)
        .filter((p) => typeId === "" || typeOfProduct(p) === typeId)
        .filter((p) => tag === "" || getCategoryTag(p.category) === tag)
        .filter(
          (p) =>
            term === "" ||
            p.name.toLowerCase().includes(term) ||
            normalizeCategory(p.category || "Gift").includes(term) ||
            (typeById(typeOfProduct(p))?.name.toLowerCase().includes(term) ?? false) ||
            (p.description || "").toLowerCase().includes(term)
        ),
    [products, typeId, tag, term]
  );

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  // Only scroll back to the top of the list when the visitor changes page (never on first load or while typing).
  const goToPage = (n: number) => {
    scrollOnPage.current = true;
    setPage(n);
  };
  useEffect(() => {
    if (!scrollOnPage.current) return;
    scrollOnPage.current = false;
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  // categories (of the chosen type) that actually contain products, with counts
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (typeId && typeOfProduct(p) !== typeId) return;
      const t = p.name ? getCategoryTag(p.category) : "";
      if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
    });
    return FILTER_OPTIONS.filter((o) => counts.has(o.value)).map((o) => ({ ...o, count: counts.get(o.value)! }));
  }, [products, typeId]);

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    products.forEach((p) => {
      if (p.name) m[typeOfProduct(p)] = (m[typeOfProduct(p)] ?? 0) + 1;
    });
    return m;
  }, [products]);
  const activeType = typeById(typeId);
  const leadHours = leadTimeHoursFor(activeType ? [activeType.id] : GIFT_TYPES.map((t) => t.id));

  const images = useMemo(() => {
    const m: Record<string, string> = {};
    products.forEach((p) => {
      if (p.image) m[p.name] = p.image;
    });
    return m;
  }, [products]);

  // "added" opens the slide-out cart; other notices stay as small toasts
  const announce = (message: string, type: "added" | "removed" = "added") => {
    if (type === "added") setDrawer(message);
    else notify(message, type);
  };

  const commitFromModal = (product: Product, quantity: number, option: SizeOption) => {
    const item: Omit<CartItem, "quantity"> = {
      name: product.name,
      amount: option.amount,
      unit: option.unit,
      label: option.label,
      unitPrice: option.price,
      type: typeOfProduct(product),
    };
    setItem(item, quantity);
    announce(`${product.name} (${option.label}) ${quantity > 1 ? "updated in" : "added to"} your cart`, "added");
  };

  const pagination = () => {
    const buttons: React.ReactNode[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        buttons.push(
          <button
            key={i}
            className={`pagination-btn page-number ${i === page ? "active" : ""}`}
            onClick={() => goToPage(i)}
          >
            {i}
          </button>
        );
      } else if (i === page - 2 || i === page + 2) {
        buttons.push(<span key={`d${i}`} className="pagination-dots">...</span>);
      }
    }
    return (
      <div className="pagination">
        <button className="pagination-btn" disabled={page === 1} onClick={() => goToPage(page - 1)}>
          <Icon name="chevron-left" /> Previous
        </button>
        {buttons}
        <button
          className="pagination-btn"
          disabled={page === totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next <Icon name="chevron-right" />
        </button>
      </div>
    );
  };

  return (
    <div className="site page-products">
      <Navbar active="products" />
      {notification}
      <BorderDivider />

      <main id="main" tabIndex={-1}>
      <div className="product-container">
        <div className="lx-head" data-reveal="">
          <span className="lx-eyebrow">The collection</span>
          <h1 className="lx-title">Our Gifts</h1>
          <p className="lx-sub">Three handcrafted collections, made to order in Mumbai. Pick a collection, choose a favourite, or design something entirely your own.</p>
        </div>

        <div className="gt-tabs" role="tablist" aria-label="Product type" data-reveal="">
          <button type="button" role="tab" aria-selected={typeId === ""} className={typeId === "" ? "gt-tab active" : "gt-tab"} onClick={() => chooseType("")}>
            <Icon name="gift" />
            <strong>All gifts</strong>
            <span>{products.filter((p) => p.name).length} items</span>
          </button>
          {GIFT_TYPES.map((t) => (
            <button
              type="button"
              role="tab"
              key={t.id}
              aria-selected={typeId === t.id}
              className={typeId === t.id ? "gt-tab active" : "gt-tab"}
              onClick={() => chooseType(t.id)}
            >
              <Icon name={t.id === "resin" ? "gem" : t.id === "candles" ? "fire" : "spa"} />
              <strong>{t.name}</strong>
              <span>{t.brand} · {typeCounts[t.id] ?? 0} items</span>
            </button>
          ))}
        </div>

        <div className="gt-panels" data-reveal="">
          {activeType ? (
            <section className="gt-panel" aria-live="polite">
              <img className="gt-panel-logo" src={activeType.logo} alt={`${activeType.brand} logo`} width={96} height={96} />
              <div>
                <p className="gt-panel-brand">{activeType.brand}</p>
                <h2>{activeType.name}</h2>
                <p className="gt-panel-tag">{activeType.tagline}</p>
                <p>{activeType.description}</p>
                <ul className="gt-panel-points">
                  {activeType.highlights.map((h) => (
                    <li key={h}><Icon name="check-circle" /> {h}</li>
                  ))}
                </ul>
                <p className="gt-panel-note"><Icon name="clock-o" /> Order at least {activeType.leadTimeLabel} ahead. {activeType.leadTimeNote}</p>
              </div>
            </section>
          ) : (
            <div className="gt-overview">
              {GIFT_TYPES.map((t) => (
                <button type="button" className="gt-overview-card" key={t.id} onClick={() => chooseType(t.id)}>
                  <img src={t.logo} alt="" width={56} height={56} />
                  <span>
                    <strong>{t.name}</strong>
                    <em>{t.brand}</em>
                    <small>{t.tagline}. Ready in about {t.leadTimeLabel}.</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lx-info" data-reveal="">
          <ul className="lx-info-list">
            <li><Icon name="magic" /> Handmade to order</li>
            <li><Icon name="clock-o" /> Order at least {leadHours >= 48 ? `${Math.round(leadHours / 24)} days` : `${leadHours} hours`} ahead{activeType ? "" : " (varies by type)"}</li>
            <li><Icon name="credit-card" /> {site.advancePercent}% advance confirms your order</li>
          </ul>
          <PincodeCheck />
        </div>

        <div className="filter-search">
          <div className="search-container lx-search">
            <Icon name="search" />
            <input
              type="text"
              id="search"
              placeholder="Search gifts, scents, materials…"
              aria-label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {categories.length > 1 && (
          <div className="lx-chips" role="group" aria-label="Filter by category">
            <button type="button" className={tag === "" ? "lx-chip active" : "lx-chip"} aria-pressed={tag === ""} onClick={() => setTag("")}>
              All <span>{products.filter((p) => p.name).length}</span>
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c.value}
                className={tag === c.value ? "lx-chip active" : "lx-chip"}
                aria-pressed={tag === c.value}
                onClick={() => setTag(c.value)}
              >
                {c.label} <span>{c.count}</span>
              </button>
            ))}
          </div>
        )}

        <div ref={gridRef} className="lx-scroll-anchor" />
        {status === "ready" && (
          <p className="lx-count" role="status" aria-live="polite">
            Showing {filtered.length} {filtered.length === 1 ? "gift" : "gifts"}
          </p>
        )}

        <div className="product-cards" id="product-cards-container">
          {status === "loading" &&
            Array.from({ length: 8 }, (_, i) => (
              <div className="lx-skel-card light" key={i} aria-hidden="true">
                <div className="lx-skel lx-skel-img" />
                <div className="lx-skel lx-skel-line" />
                <div className="lx-skel lx-skel-line short" />
                <div className="lx-skel lx-skel-btn" />
              </div>
            ))}

          {status === "error" && (
            <div className="error-container" role="alert">
              <Icon name="exclamation-triangle" className="error-icon" />
              <p className="error-title">Oops! Something went wrong</p>
              <p className="error-message">We couldn&apos;t load our lovely gifts right now.</p>
              <button onClick={load} className="retry-btn">
                <Icon name="refresh" /> Try Again
              </button>
            </div>
          )}

          {status === "ready" &&
            pageItems.map((product, i) => (
              <div className="lx-card-wrap" key={product.name} data-reveal="" style={{ "--i": i % 4 } as React.CSSProperties}>
                <ProductCard
                  product={product}
                  cart={cart}
                  onSetItem={setItem}
                  onOpenModal={setModalProduct}
                  notify={announce}
                />
              </div>
            ))}
        </div>

        {status === "ready" && filtered.length === 0 && (
          <div className="lx-empty">
            <Icon name="gift" />
            <h2>We couldn&apos;t find a match</h2>
            <p>Try another word or category, or tell us what you have in mind and we&apos;ll create it for you.</p>
            <div className="lx-empty-actions">
              <button type="button" className="lx-btn lx-btn-light lx-btn-sm" onClick={() => { setSearch(""); setTag(""); }}>
                Clear filters
              </button>
              <Link href="/special-order/" className="lx-btn lx-btn-primary lx-btn-sm">Design a custom gift</Link>
              <button type="button" className="lx-btn lx-btn-primary lx-btn-sm" onClick={() => openWhatsApp("Hi! I'm looking for a gift that isn't on the website 🎁")}>
                <Icon name="whatsapp" /> Ask on WhatsApp
              </button>
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="pagination-container">{totalPages > 1 && pagination()}</div>
        )}
      </div>

      <BorderDivider />
      </main>
      <Footer />

      {drawer !== null && (
        <MiniCart message={drawer} cart={cart} images={images} onSetItem={setItem} onClose={() => setDrawer(null)} />
      )}

      {modalProduct && (
        <ProductModal
          key={modalProduct.name}
          product={modalProduct}
          cart={cart}
          onClose={() => setModalProduct(null)}
          onCommit={(q, opt) => commitFromModal(modalProduct, q, opt)}
        />
      )}
    </div>
  );
}
