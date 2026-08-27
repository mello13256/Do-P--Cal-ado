import { Seo } from '../components/Seo'
import { AboutSection } from '../components/home/AboutSection'
import { BrandSection } from '../components/home/BrandSection'
import { CategorySection } from '../components/home/CategorySection'
import { ContactSection } from '../components/home/ContactSection'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { Hero } from '../components/home/Hero'
import { TrustStrip } from '../components/home/TrustStrip'

export default function HomePage() {
  return (
    <>
      <Seo path="/" />
      <Hero />
      <TrustStrip />
      <CategorySection />
      <FeaturedProducts />
      <BrandSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
