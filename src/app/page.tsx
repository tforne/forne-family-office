import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import AboutSection from "@/components/public/AboutSection";
import ServicesSection from "@/components/public/ServicesSection";
import ClientAreaSection from "@/components/public/ClientAreaSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-forne-cream text-forne-forest">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <ServicesSection />
        <ClientAreaSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
