import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import Solutions from "@/components/sections/Solutions";
import Technology from "@/components/sections/Technology";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
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
