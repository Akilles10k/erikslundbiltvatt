"use client";

import { useEffect, useState } from "react";
import BookingForm from "@/components/BookingForm";
import { useCart } from "@/context/CartContext";

export default function CartBar() {
  const { items, removeFromCart, clearCart, totalCount } = useCart();
  const [showBooking, setShowBooking] = useState(false);
  const bookingOpen = showBooking && totalCount > 0;

  useEffect(() => {
    if (!bookingOpen) return;
    document.body.classList.add("cart-booking-open");
    return () => document.body.classList.remove("cart-booking-open");
  }, [bookingOpen]);

  const handleClearCart = () => {
    clearCart();
    setShowBooking(false);
  };

  const handleRemoveFromCart = (serviceId: number, quantity: number) => {
    removeFromCart(serviceId);
    if (totalCount <= quantity) setShowBooking(false);
  };

  if (totalCount === 0) return null;

  const closeBooking = () => setShowBooking(false);

  return (
    <aside
      className={`cart-bar ${bookingOpen ? "cart-bar--booking" : ""}`}
      aria-label={showBooking ? "Boka tid" : "Valda tjänster"}
    >
      <div className={`cart-bar-inner ${bookingOpen ? "cart-bar-inner--booking" : ""}`}>
        {bookingOpen ? (
          <BookingForm variant="embedded" onClose={closeBooking} />
        ) : (
          <>
            <div className="cart-bar-header">
              <p className="cart-bar-title">
                Din kundvagn <span className="cart-bar-count">{totalCount}</span>
              </p>
              <button type="button" className="cart-bar-clear" onClick={handleClearCart}>
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
                    onClick={() => handleRemoveFromCart(service.id, quantity)}
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
