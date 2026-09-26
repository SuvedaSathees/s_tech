import SmoothScroll from "@/v2/components/SmoothScroll";
import Nav from "@/v2/components/Nav";
import Hero from "@/v2/components/hero/Hero";
import Solutions from "@/v2/components/sections/Solutions";
import Technology from "@/v2/components/sections/Technology";
import Projects from "@/v2/components/sections/Projects";
import About from "@/v2/components/sections/About";
import Contact from "@/v2/components/sections/Contact";
import Footer from "@/v2/components/sections/Footer";

export default function V2Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Hero />
        <Solutions />
        <Technology />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
