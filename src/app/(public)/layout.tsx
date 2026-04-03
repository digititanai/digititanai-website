import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DataLoader from '@/components/layout/DataLoader'
import ButtonClickTracker from '@/components/layout/ButtonClickTracker'
import StarField from '@/components/ui/StarField'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataLoader>
      <ButtonClickTracker />
      <StarField />
      <Navbar />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Footer />
    </DataLoader>
  )
}
