"use client";

import type { Service } from "@/data/site";
import { useCart } from "@/context/CartContext";

type CampaignPrice = {
  originalPrice: string;
  campaignPrice: string;
};

export default function ServiceCard({
  service,
  campaign,
}: {
  service: Service;
  campaign?: CampaignPrice;
}) {
  const { addToCart, isInCart } = useCart();
  const added = isInCart(service.id);
  const isCampaign = Boolean(campaign);

  return (
    <article
      id={`service-${service.id}`}
      className={`service-card${isCampaign ? " service-card--campaign" : ""}${
        added && isCampaign ? " service-card--campaign-selected" : ""
      }`}
    >
      {isCampaign && (
        <p className="service-card-badge" aria-hidden>
          50% RABATT
        </p>
      )}
      <div className="service-card-top">
        <span className="service-card-num">
          {String(service.id).padStart(2, "0")}
        </span>
        {campaign ? (
          <p className="service-card-price service-card-price--campaign">
            <span className="service-card-price-old">{campaign.originalPrice}</span>
            <span className="service-card-price-new">{campaign.campaignPrice}</span>
          </p>
        ) : (
          <p className="service-card-price">{service.price}</p>
        )}
      </div>
      <h3 className="service-card-title">{service.name}</h3>
      {service.priceLarge && !campaign && (
        <p className="service-card-price-alt">{service.priceLarge}</p>
      )}
      {campaign && (
        <p className="service-card-price-alt">
          Kampanjpris för nya kunder – ordinarie {campaign.originalPrice}
        </p>
      )}
      <p className="service-card-text">{service.description}</p>
      <div className="service-card-footer">
        {service.duration ? (
          <p className="service-card-duration">{service.duration}</p>
        ) : (
          <span
            className="service-card-duration service-card-duration--empty"
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          className={`service-card-add-btn ${added ? "service-card-add-btn--added" : ""}`}
          onClick={() => addToCart(service)}
        >
          {added ? "Tillagd" : "Lägg till"}
        </button>
      </div>
    </article>
  );
}
