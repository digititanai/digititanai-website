import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DataLoader from '@/components/layout/DataLoader'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataLoader>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </DataLoader>
  )
}
