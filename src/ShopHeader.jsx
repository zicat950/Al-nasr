import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useShop } from './shopStore';

export default function ShopHeader({ title, sub }) {
  const { cartCount, wish } = useShop();
  return (
    <header className="jx-head">
      <div className="jx-head__row">
        <Link to="/drinks" className="jx-back">← Drinks</Link>
        <nav className="jx-links" aria-label="Shop">
          <NavLink to="/juice" className="jx-link">Juices</NavLink>
          <NavLink to="/wishlist" className="jx-link">Wishlist{wish.length > 0 && <b>{wish.length}</b>}</NavLink>
          <NavLink to="/cart" className="jx-link">Cart{cartCount > 0 && <b>{cartCount}</b>}</NavLink>
        </nav>
      </div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </header>
  );
}