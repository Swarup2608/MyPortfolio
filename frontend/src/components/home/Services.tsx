"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/siteConfig";

export function Services() {
  return (
    <section
      className="relative z-5 bg-white px-[clamp(20px,3vw,40px)] py-[clamp(60px,9vw,128px)]"
      style={{ borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0" }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-[clamp(60px,8vw,112px)] text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-[0.9] tracking-[-.03em] text-[#0C0C0C]"
      >
        Services
      </motion.h2>

      <div className="mx-auto max-w-[1024px]">
        {services.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-start gap-[clamp(18px,3vw,44px)] border-t border-[#0C0C0C]/15 py-[clamp(28px,4vw,48px)]"
          >
            <div className="flex-none text-[clamp(3rem,10vw,140px)] font-black leading-[0.85] tracking-[-.04em] text-[#0C0C0C]">
              {s.num}
            </div>
            <div className="flex flex-col gap-[clamp(8px,1vw,14px)] pt-[clamp(4px,1vw,14px)]">
              <div className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase leading-[1.1] tracking-[.02em] text-[#0C0C0C]">
                {s.name}
              </div>
              <p className="max-w-[672px] text-[clamp(.85rem,1.6vw,1.25rem)] font-light leading-[1.65] text-[#0C0C0C]/60">
                {s.desc}
              </p>
            </div>
          </motion.div>
        ))}
        <div className="border-t border-[#0C0C0C]/15" />
      </div>
    </section>
  );
}
