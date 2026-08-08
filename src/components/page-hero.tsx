export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return <header className="container py-14 md:py-20"><p className="eyebrow mb-4">{eyebrow}</p><h1 className="display max-w-4xl text-5xl leading-[.88] md:text-8xl">{title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#aab5bc]">{intro}</p></header>;
}
