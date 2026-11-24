import React, { useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Dates from './Dates';
import Nuts from './Nuts';
import Chocolates from './Chocolates';
import Gift from './Gift';
import Drinks from './Drinks';
import Contact from './Contact';
import Cart from './Cart';
import Wishlist from './Wishlist';
import Search from './Search';

import './App.css';

gsap.registerPlugin(ScrollTrigger);

/* Scroll to top on every page change and re-measure the pinned/scroll animations.
   Depends on pathname only, so "?type=..." filter links don't jump to the top. */
function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

/* The home page keeps your original stack of sections, unchanged */
function Home() {
  return (
    <>
      <Hero key="hero" />
      <About key="home-about" />
      <Dates key="dates" />
      <Nuts key="nuts" />
      <Chocolates key="chocolates" />
      <Gift key="gift" />
      <Drinks key="drinks" shopHref="/search?q=drinks" />
      <Contact key="contact" />
    </>
  );
}

/* Simple page so a link never goes blank. It shows the address that failed,
   so a wrong link is easy to spot. */
function Placeholder({ title, showPath }) {
  const { pathname } = useLocation();
  return (
    <main style={{ minHeight: '55vh', display: 'grid', placeContent: 'center', textAlign: 'center', gap: 12, padding: 24, background: '#f1f2ec', color: '#26372d' }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {showPath
        ? <p style={{ margin: 0, opacity: 0.7 }}>No page exists at <code>{pathname}</code></p>
        : <p style={{ margin: 0, opacity: 0.7 }}>This page is coming soon.</p>}
      <Link to="/">Back to home</Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* every navbar link has its own page */}
        <Route path="/about" element={<About key="about" />} />
        <Route path="/dates" element={<Dates key="dates-page" />} />
        <Route path="/nuts-dry-fruits" element={<Nuts key="nuts-page" />} />
        <Route path="/chocolates" element={<Chocolates key="chocolates-page" />} />
        <Route path="/gift-hampers" element={<Gift key="gift-page" />} />
        <Route path="/drinks-beverages" element={<Drinks key="drinks-page" shopHref="/search?q=drinks" />} />
        <Route path="/contact" element={<Contact key="contact-page" />} />

        {/* shopping — the cart answers to every common address */}
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/bag" element={<Navigate to="/cart" replace />} />
        <Route path="/shopping-cart" element={<Navigate to="/cart" replace />} />
        <Route path="/checkout" element={<Navigate to="/cart" replace />} />
        <Route path="/account" element={<Placeholder title="My account" />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="*" element={<Placeholder title="Page not found" showPath />} />
      </Routes>
    </>
  );
}