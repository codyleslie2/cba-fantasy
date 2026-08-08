export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return <header className="container py-12 md:py-16"><p className="eyebrow mb-4">{eyebrow}</p><h1 className="display max-w-4xl text-5xl leading-[.92] md:text-7xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#a5adb6]">{intro}</p></header>;
}
