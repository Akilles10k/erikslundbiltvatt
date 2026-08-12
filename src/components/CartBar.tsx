"use client";

import { useEffect, useState } from "react";
import BookingForm from "@/components/BookingForm";
import { useCart } from "@/context/CartContext";

export default function CartBar() {
  const { items, removeFromCart, clearCart, totalCount } = useCart();
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!showBooking) return;
    document.body.classList.add("cart-booking-open");
    return () => document.body.classList.remove("cart-booking-open");
  }, [showBooking]);

  useEffect(() => {
    if (totalCount === 0) setShowBooking(false);
  }, [totalCount]);

  if (totalCount === 0) return null;

  const closeBooking = () => setShowBooking(false);

  return (
    <aside
      className={`cart-bar ${showBooking ? "cart-bar--booking" : ""}`}
      aria-label={showBooking ? "Boka tid" : "Valda tjänster"}
    >
      <div className={`cart-bar-inner ${showBooking ? "cart-bar-inner--booking" : ""}`}>
        {showBooking ? (
          <BookingForm variant="embedded" onClose={closeBooking} />
        ) : (
          <>
            <div className="cart-bar-header">
              <p className="cart-bar-title">
                Din kundvagn <span className="cart-bar-count">{totalCount}</span>
              </p>
              <button type="button" className="cart-bar-clear" onClick={clearCart}>
                Töm
              </button>
            </div>

            <ul className="cart-bar-list">
              {items.map(({ service, quantity }) => (
                <li key={service.id} className="cart-bar-item">
                  <div className="cart-bar-item-info">
                    <span className="cart-bar-item-name">{service.name}</span>
                    <span className="cart-bar-item-meta">
                      {quantity > 1 ? `${quantity} × ` : ""}
                      {service.price}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cart-bar-remove"
                    onClick={() => removeFromCart(service.id)}
                    aria-label={`Ta bort ${service.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="cart-bar-checkout"
              onClick={() => setShowBooking(true)}
            >
              Gå till bokning
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
