const ITEMS = [
  'Technology Consulting',
  'STR Market Intelligence',
  'Investor Advisory',
  'Tourism Software',
  'Property Management',
  'Broken Bow Market',
];

export default function MarqueeStrip() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee-track">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i}>
            <span className="marquee-item">{item}</span>
            <span className="marquee-item marquee-sep">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
