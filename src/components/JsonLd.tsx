type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  const graphs = Array.isArray(data) ? data : [data];
  const payload =
    graphs.length === 1
      ? graphs[0]
      : {
          "@context": "https://schema.org",
          "@graph": graphs.map((entry) => {
            const { "@context": _context, ...rest } = entry;
            return rest;
          }),
        };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
