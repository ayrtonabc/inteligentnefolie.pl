export default function SeoKeywords() {
  const keywords = [
    "smart okno Poznań",
    "folia elektryczna Poznań",
    "folia ciekłokrystaliczna Poznań",
    "folia elektryczna na okna Poznań",
    "folia PDLC Poznań",
    "folia smart glass Poznań",
    "smart glass Poznań"
  ];

  return (
    <section className="py-8 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-4">
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Inteligentna Folia Poznań</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
          {keywords.map((kw, idx) => (
            <span key={idx} className="text-gray-400 text-xs font-light">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}