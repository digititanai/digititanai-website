import HeroSection from '@/components/home/HeroSection'
import ServicesOverview from '@/components/home/ServicesOverview'
import FeaturedPortfolio from '@/components/home/FeaturedPortfolio'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import BlogPreview from '@/components/home/BlogPreview'
import FAQSection from '@/components/home/FAQSection'

export const metadata = {
  title: 'Sabbir Ahsan | Digital Marketer & MarTech Specialist',
  description:
    'Transforming brands through data-driven digital strategies and cutting-edge marketing technology.',
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <div className="container-main">
        <div className="line-divider-gold" />
      </div>

      <ServicesOverview />

      <div className="container-main">
        <div className="line-divider" />
      </div>

      <FeaturedPortfolio />

      <TestimonialsSection />

      <div className="container-main">
        <div className="line-divider" />
      </div>

      <BlogPreview />

      <div className="container-main">
        <div className="line-divider" />
      </div>

      <FAQSection />
    </main>
  )
}
