import AboutSection from "@/components/public/AboutSection";
import ClientAreaSection from "@/components/public/ClientAreaSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import ServicesSection from "@/components/public/ServicesSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-forne-cream">
      <Header />
      <Hero />
      <AboutSection />
      <ServicesSection />
      <ClientAreaSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
