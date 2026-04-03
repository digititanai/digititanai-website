import HeroSection from '@/components/home/HeroSection'
import ClientLogos from '@/components/home/ClientLogos'
import StatsSection from '@/components/home/StatsSection'
import ServicesOverview from '@/components/home/ServicesOverview'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import FeaturedPortfolio from '@/components/home/FeaturedPortfolio'
import ResultsShowcase from '@/components/home/ResultsShowcase'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import ToolsIntegrations from '@/components/home/ToolsIntegrations'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import BlogPreview from '@/components/home/BlogPreview'
import FAQSection from '@/components/home/FAQSection'
import SectionDivider from '@/components/ui/SectionDivider'
import ScrollProgress from '@/components/ui/ScrollProgress'
import SmoothScroll from '@/components/ui/SmoothScroll'

export const metadata = {
  title: 'DigiTitan AI | AI-Powered Digital Solutions',
  description:
    'Transforming brands through data-driven digital strategies and cutting-edge marketing technology.',
}

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <SmoothScroll>
        <main className="relative z-10">
          <HeroSection />
          <ClientLogos />
          <SectionDivider />
          <StatsSection />
          <SectionDivider />
          <ServicesOverview />
          <SectionDivider />
          <WhyChooseUs />
          <SectionDivider />
          <FeaturedPortfolio />
          <SectionDivider />
          <ResultsShowcase />
          <SectionDivider />
          <HowItWorksSection />
          <SectionDivider />
          <ToolsIntegrations />
          <SectionDivider />
          <TestimonialsSection />
          <SectionDivider />
          <BlogPreview />
          <SectionDivider />
          <FAQSection />
        </main>
      </SmoothScroll>
    </>
  )
}
