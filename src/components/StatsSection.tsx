import Link from "next/link";

export default function StatsSection() {
  return (
    <section className="stats">
      <span className="stats-watermark" aria-hidden>
        4000
      </span>
      <div className="stats-content">
        <h2 className="stats-heading">
          Över fräscha bilar i Erikslund
        </h2>
        <p className="stats-sub">20 bilar dagligen – biltvätt & bilrekond</p>
        <Link href="/tjanster" className="stats-btn">
          Se galleri
        </Link>
      </div>
    </section>
  );
}
