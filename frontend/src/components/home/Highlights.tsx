import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { highlights } from "@/lib/siteConfig";

export function Highlights() {
  return (
    <section className="border-t border-foreground/9 bg-background py-[clamp(60px,8vw,110px)]">
      <Container className="max-w-[1200px] px-[clamp(20px,3vw,40px)]">
        <div className="grid gap-[clamp(16px,2vw,26px)] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {highlights.map((h, i) => (
            <Reveal key={h.label} delay={i * 0.06} y={26}>
              <div className="rounded-[26px] border border-foreground/14 bg-surface px-[18px] py-[clamp(24px,3vw,38px)] text-center">
                <div
                  className="bg-clip-text text-[clamp(2.2rem,5vw,3.6rem)] font-black tracking-[-.04em] text-transparent"
                  style={{ backgroundImage: "linear-gradient(180deg,#BBCCD7 0%,#646973 100%)" }}
                >
                  {h.value}
                </div>
                <div className="mt-2.5 text-[.75rem] font-light uppercase tracking-[.12em] text-foreground/55">
                  {h.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
