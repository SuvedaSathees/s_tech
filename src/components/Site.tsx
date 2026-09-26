"use client";

import SmoothScroll from "@/components/SmoothScroll";
import CursorLight from "@/components/ui/CursorLight";
import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import Solutions from "@/components/sections/Solutions";
import Ecosystem from "@/components/sections/Ecosystem";
import Projects from "@/components/sections/Projects";
import Technology from "@/components/sections/Technology";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

/** Whole-page composition (shared by the Next.js route and the static preview bundle). */
export default function Site() {
  return (
    <>
      <SmoothScroll />
      <CursorLight />
      <Nav />
      <main>
        <Hero />
        <Solutions />
        <Ecosystem />
        <Projects />
        <Technology />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
