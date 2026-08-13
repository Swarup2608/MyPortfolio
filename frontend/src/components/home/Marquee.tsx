import { skills } from "@/lib/siteConfig";

const allSkills = skills.flatMap((g) => g.items);
// Duplicated once so the two halves can be looped seamlessly with a -50% translate.
const row1 = [...allSkills, ...allSkills];
const row2 = [...allSkills.slice().reverse(), ...allSkills.slice().reverse()];

function MarqueeRow({ items, direction }: { items: string[]; direction: "left" | "right" }) {
  return (
    <div className="overflow-hidden">
      <div
        className={
          "flex w-max gap-3 " +
          (direction === "left" ? "animate-marquee-left" : "animate-marquee-right")
        }
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex-none rounded-2xl border border-foreground/10 bg-surface px-8 py-6 text-lg font-medium uppercase tracking-wide text-foreground/70 sm:text-2xl"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section className="flex flex-col gap-3 overflow-hidden py-16 sm:py-24">
      <MarqueeRow items={row1} direction="left" />
      <MarqueeRow items={row2} direction="right" />
    </section>
  );
}
