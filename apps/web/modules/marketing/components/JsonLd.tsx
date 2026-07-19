type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Renders a JSON-LD structured-data block. `<` is escaped to keep the payload script-safe. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
