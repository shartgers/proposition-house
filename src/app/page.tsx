import { Dashboard } from '@/components/dashboard'
import { PROPOSITIONS } from '@/lib/mock-data'

export default function Home() {
  return <Dashboard propositions={PROPOSITIONS} />
}
