import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Minus, Plus, X, ShoppingBag, ArrowLeft, Banknote, CreditCard, MessageCircle, Check, ShieldCheck, QrCode, Copy,
} from "lucide-react";
import { useCart } from "./CartContext";
import { makeQr } from "./qr";
import "./Cart.css";
import "./cartPay.css";

/* ------------------------------------------------------------------ */
/*  SETTINGS — edit these                                              */
/* ------------------------------------------------------------------ */

/** WhatsApp number that receives orders: digits only, with country code (e.g. "919876543210").
    Leave "" to disable the WhatsApp option. */
const WHATSAPP_NUMBER = "";

const STORE_NAME = "AL NASR";

/** UPI payment (scan & pay) — the QR code always carries the EXACT order total.
    UPI_ID  : your UPI ID / VPA exactly as it appears in your bank or PhonePe/GPay business app,
              e.g. "alnasr@okhdfcbank". Leave "" to switch the option off.
    UPI_NAME: the name customers should see when they pay (your shop / account name). */
const UPI_ID = "";
const UPI_NAME = "AL NASR";

/** Prices are shown in Indian Rupees (₹).
    (If you prefer your old shared formatter, replace this with:
     import { formatPrice } from "./products";) */
const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on delivery", hint: "Pay when your order arrives", icon: Banknote },
  { id: "upi", label: "UPI — scan & pay", hint: "Scan the QR with GPay, PhonePe, Paytm or any UPI app", icon: QrCode },
  { id: "online", label: "Card / online payment", hint: "Secure payment through your payment provider", icon: CreditCard },
  { id: "whatsapp", label: "Order on WhatsApp", hint: "Send your order to us and confirm by chat", icon: MessageCircle },
];

/* ------------------------------------------------------------------ */

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", city: "", notes: "" };

/* "Ajwa Premium (250g)" — name with the chosen weight */
const label = (i) => (i.weight ? `${i.name} (${i.weight})` : i.name);

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name";
  if (f.phone.replace(/\D/g, "").length < 8) e.phone = "Please enter a valid phone number";
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Please enter a valid email";
  if (f.address.trim().length < 6) e.address = "Please enter your delivery address";
  if (f.city.trim().length < 2) e.city = "Please enter your city";
  return e;
}

/** upi://pay link with the exact amount (2 decimals) — this is what the QR code contains */
function upiLink(amount, orderId) {
  const q = (v) => encodeURIComponent(v).replace(/%40/g, "@");
  return (
    `upi://pay?pa=${q(UPI_ID)}&pn=${q(UPI_NAME)}&am=${Number(amount).toFixed(2)}` +
    `&cu=INR&tn=${q(`${STORE_NAME} order ${orderId}`)}&tr=${q(orderId)}`
  );
}

function QrSvg({ text }) {
  const qr = useMemo(() => {
    try { return makeQr(text); } catch (e) { return null; }
  }, [text]);
  if (!qr) return <p className="ct-upi__err">Could not create the QR code. Please use another payment option.</p>;
  const quiet = 3;
  const dim = qr.size + quiet * 2;
  let d = "";
  qr.modules.forEach((row, y) => row.forEach((on, x) => {
    if (on) d += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  }));
  return (
    <svg className="ct-upi__qr" viewBox={`0 0 ${dim} ${dim}`} shapeRendering="crispEdges" role="img" aria-label="UPI payment QR code">
      <rect width={dim} height={dim} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}

function UpiPanel({ amount, orderId, ref_, setRef, error }) {
  const link = upiLink(amount, orderId);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) { /* clipboard blocked */ }
  };
  return (
    <div className="ct-upi">
      <div className="ct-upi__scan">
        <QrSvg text={link} />
        <p className="ct-upi__amount">Pay exactly <strong>{formatPrice(amount)}</strong></p>
      </div>
      <div className="ct-upi__info">
        <ol>
          <li>Open GPay, PhonePe, Paytm or any UPI app and tap <b>Scan</b>.</li>
          <li>Scan this code. The amount <b>{formatPrice(amount)}</b> is filled in for you.</li>
          <li>Pay, then type the <b>UTR / transaction ID</b> from the receipt below.</li>
        </ol>
        <div className="ct-upi__id">
          <span>UPI ID</span>
          <b>{UPI_ID}</b>
          <button type="button" onClick={copy} aria-label="Copy UPI ID">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <a className="ct-upi__app" href={link}>Open UPI app on this phone</a>
        <label className={`ct-field${error ? " has-error" : ""}`}>
          <span>UTR / transaction ID</span>
          <input
            value={ref_}
            onChange={(e) => setRef(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 30))}
            inputMode="text"
            autoComplete="off"
            placeholder="e.g. 412345678901"
          />
          {error && <small role="alert">{error}</small>}
        </label>
        <p className="ct-upi__note">Your order is confirmed after we match this payment in our account.</p>
      </div>
    </div>
  );
}

function buildOrderText(order) {
  const lines = order.items.map((i) => `• ${label(i)} × ${i.qty} — ${formatPrice(i.price * i.qty)}`);
  return [
    `New order ${order.id} — ${STORE_NAME}`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Payment: ${order.paymentLabel}${order.paymentRef ? ` (ref ${order.paymentRef})` : ""}`,
    "",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    order.customer.email ? `Email: ${order.customer.email}` : null,
    `Address: ${order.customer.address}, ${order.customer.city}`,
    order.customer.notes ? `Notes: ${order.customer.notes}` : null,
  ].filter((l) => l !== null).join("\n");
}

function saveOrder(order) {
  try {
    const all = JSON.parse(localStorage.getItem("alnasr-orders") || "[]");
    all.unshift(order);
    localStorage.setItem("alnasr-orders", JSON.stringify(all.slice(0, 50)));
  } catch {
    /* storage unavailable — order is still completed */
  }
}

/**
 * Cart page — route: /cart
 *
 * Props (optional):
 *   onPayOnline(order) → async function that opens your payment gateway (Stripe, Razorpay, Telr, …)
 *                        and resolves true when the payment succeeded. Until you pass this,
 *                        the "Card / online payment" option explains that it is not connected yet.
 */
export default function Cart({ onPayOnline }) {
  const { items, count, subtotal, setQty, remove, clear } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState("cod");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [placed, setPlaced] = useState(null);
  const [orderId] = useState(() => `AN-${Date.now().toString(36).toUpperCase()}`);
  const [upiRef, setUpiRef] = useState("");
  const [upiErr, setUpiErr] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const finish = (order) => {
    saveOrder(order);
    setPlaced(order);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async (ev) => {
    ev.preventDefault();
    setNotice("");
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = document.querySelector(".ct-field.has-error input, .ct-field.has-error textarea");
      first?.focus();
      return;
    }

    const method = PAYMENT_METHODS.find((m) => m.id === payment);

    if (payment === "upi") {
      if (!UPI_ID) {
        setNotice("UPI payment isn't set up yet. Add your UPI ID at the top of Cart.jsx, or choose another payment option.");
        return;
      }
      if (!/^[A-Za-z0-9]{8,30}$/.test(upiRef)) {
        setUpiErr("Enter the UTR / transaction ID from your UPI app after paying");
        document.querySelector(".ct-upi input")?.focus();
        return;
      }
    }

    const order = {
      id: orderId,
      date: new Date().toISOString(),
      items: items.map(({ id, name, price, qty, category, weight }) => ({ id, name, price, qty, category, weight })),
      subtotal,
      customer: { ...form },
      payment,
      paymentLabel: method.label,
      ...(payment === "upi" ? { paymentRef: upiRef, paymentStatus: "awaiting-verification" } : {}),
    };

    if (payment === "whatsapp") {
      if (!WHATSAPP_NUMBER) {
        setNotice("WhatsApp ordering isn't set up yet. Add your number at the top of Cart.jsx, or choose another payment option.");
        return;
      }
      // opened directly from the click so mobile browsers don't block it
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderText(order))}`, "_blank", "noopener");
      finish(order);
      return;
    }

    if (payment === "online") {
      if (!onPayOnline) {
        setNotice("Online card payment isn't connected yet. Please choose Cash on delivery or WhatsApp for now.");
        return;
      }
      setBusy(true);
      try {
        const ok = await onPayOnline(order);
        if (ok) finish({ ...order, paid: true });
        else setNotice("Payment was not completed. You have not been charged.");
      } catch {
        setNotice("Something went wrong with the payment. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    finish(order); // cash on delivery
  };

  /* ---------- order confirmed ---------- */
  if (placed) {
    return (
      <main className="ct ct-done">
        <span className="ct-done__icon"><Check size={30} strokeWidth={1.6} /></span>
        <h1 className="ct-title">Thank you, {placed.customer.name.split(" ")[0]}</h1>
        <p className="ct-muted">
          Your order <strong>{placed.id}</strong> has been received
          {placed.payment === "whatsapp" ? " — please finish the chat on WhatsApp to confirm it" : ""}.
        </p>
        <div className="ct-done__box">
          {placed.items.map((i) => (
            <div key={i.id}><span>{label(i)} × {i.qty}</span><b>{formatPrice(i.price * i.qty)}</b></div>
          ))}
          <div className="ct-done__total"><span>Total</span><b>{formatPrice(placed.subtotal)}</b></div>
          <small>
            Payment: {placed.paymentLabel}
            {placed.paid ? " (paid)" : ""}
            {placed.paymentRef ? ` · ref ${placed.paymentRef} · we are verifying your payment` : ""}
          </small>
        </div>
        <Link to="/" className="ct-btn">Continue shopping</Link>
      </main>
    );
  }

  /* ---------- empty ---------- */
  if (items.length === 0) {
    return (
      <main className="ct ct-empty">
        <ShoppingBag size={44} strokeWidth={1.1} aria-hidden="true" />
        <h1 className="ct-title">Your bag is empty</h1>
        <p className="ct-muted">Dates, nuts, chocolates and gifts are waiting for you.</p>
        <div className="ct-empty-links">
          <Link to="/dates" className="ct-btn">Shop dates</Link>
          <Link to="/gift-hampers" className="ct-btn ct-btn-ghost">Gift hampers</Link>
          <Link to="/drinks-beverages" className="ct-btn ct-btn-ghost">Drinks</Link>
        </div>
      </main>
    );
  }

  const field = (key, text, props = {}) => (
    <label className={`ct-field${errors[key] ? " has-error" : ""}${props.wide ? " is-wide" : ""}`}>
      <span>{text}{props.optional && <em> (optional)</em>}</span>
      {props.area ? (
        <textarea rows={3} value={form[key]} onChange={set(key)} autoComplete={props.ac} />
      ) : (
        <input
          type={props.type || "text"}
          inputMode={props.mode}
          value={form[key]}
          onChange={set(key)}
          autoComplete={props.ac}
        />
      )}
      {errors[key] && <small role="alert">{errors[key]}</small>}
    </label>
  );

  return (
    <main className="ct">
      <div className="ct-head">
        <div>
          <h1 className="ct-title">Shopping bag</h1>
          <p className="ct-muted">{count} {count === 1 ? "item" : "items"}</p>
        </div>
        <Link to="/dates" className="ct-back"><ArrowLeft size={16} /> Continue shopping</Link>
      </div>

      <form className="ct-grid" onSubmit={placeOrder} noValidate>
        <div className="ct-main">
          {/* 1 · items */}
          <section aria-labelledby="ct-h-items">
            <h2 className="ct-h" id="ct-h-items"><b>1</b> Your items</h2>
            <ul className="ct-list">
              {items.map((it) => (
                <li key={it.id} className="ct-item">
                  <div className="ct-thumb" aria-hidden="true">
                    {it.image ? <img src={it.image} alt="" /> : <span>{it.name.slice(0, 2)}</span>}
                  </div>

                  <div className="ct-info">
                    <span className="ct-name">{it.name}</span>
                    <span className="ct-cat">
                      {[it.category, it.weight && (it.weight === "1kg" ? "1 KG" : it.weight)].filter(Boolean).join(" · ")}
                    </span>
                    <span className="ct-unit">{formatPrice(it.price)}</span>

                    <div className="ct-qty" role="group" aria-label={`Quantity for ${it.name}`}>
                      <button type="button" onClick={() => setQty(it.id, it.qty - 1)} disabled={it.qty <= 1} aria-label="Decrease quantity">
                        <Minus size={14} />
                      </button>
                      <span aria-live="polite">{it.qty}</span>
                      <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase quantity">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="ct-line">
                    <strong>{formatPrice(it.price * it.qty)}</strong>
                    <button type="button" className="ct-remove" onClick={() => remove(it.id)} aria-label={`Remove ${it.name}`}>
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 2 · delivery */}
          <section aria-labelledby="ct-h-deliv">
            <h2 className="ct-h" id="ct-h-deliv"><b>2</b> Delivery details</h2>
            <div className="ct-fields">
              {field("name", "Full name", { ac: "name" })}
              {field("phone", "Phone number", { type: "tel", mode: "tel", ac: "tel" })}
              {field("email", "Email", { type: "email", mode: "email", ac: "email", optional: true })}
              {field("city", "City", { ac: "address-level2" })}
              {field("address", "Delivery address", { ac: "street-address", wide: true, area: true })}
              {field("notes", "Order notes", { wide: true, area: true, optional: true })}
            </div>
          </section>

          {/* 3 · payment */}
          <section aria-labelledby="ct-h-pay">
            <h2 className="ct-h" id="ct-h-pay"><b>3</b> Payment</h2>
            <div className="ct-pay" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const off = (m.id === "whatsapp" && !WHATSAPP_NUMBER) || (m.id === "upi" && !UPI_ID);
                return (
                  <label key={m.id} className={`ct-pay__opt${payment === m.id ? " is-on" : ""}${off ? " is-off" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={() => { setPayment(m.id); setNotice(""); setUpiErr(""); }}
                    />
                    <span className="ct-pay__icon"><Icon size={20} strokeWidth={1.4} /></span>
                    <span className="ct-pay__txt">
                      <strong>{m.label}</strong>
                      <small>{off ? "Not set up yet" : m.hint}</small>
                    </span>
                    <span className="ct-pay__dot" aria-hidden="true" />
                  </label>
                );
              })}
            </div>
            {payment === "upi" && UPI_ID && (
              <UpiPanel amount={subtotal} orderId={orderId} ref_={upiRef} setRef={(v) => { setUpiRef(v); setUpiErr(""); }} error={upiErr} />
            )}
            {notice && <p className="ct-notice" role="alert">{notice}</p>}
          </section>
        </div>

        {/* summary */}
        <aside className="ct-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <ul className="ct-sum-items">
            {items.map((it) => (
              <li key={it.id}><span>{label(it)} <em>× {it.qty}</em></span><b>{formatPrice(it.price * it.qty)}</b></li>
            ))}
          </ul>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>Confirmed after your order</dd></div>
          </dl>
          <div className="ct-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
          <button type="submit" className="ct-btn ct-btn-block" disabled={busy}>
            {busy ? "Processing…" : payment === "whatsapp" ? "Send order on WhatsApp" : payment === "upi" ? "I have paid · Place order" : payment === "online" ? "Pay now" : "Place order"}
          </button>
          <p className="ct-secure"><ShieldCheck size={15} /> Your details are only used to deliver your order.</p>
          <button type="button" className="ct-clear" onClick={clear}>Clear bag</button>
        </aside>
      </form>
    </main>
  );
}