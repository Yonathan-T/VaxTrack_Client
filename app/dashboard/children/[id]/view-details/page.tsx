'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ParentChildDetails } from '@/components/dashboard/parent-child-details'
import { useLanguage } from '@/lib/language-context'
import { useUser } from '@/lib/user-context'
import { ChevronLeft } from 'lucide-react'

const translations = {
  en: {
    backToChildren: 'Back to Children',
    childDetails: 'Child Details',
  },
  am: {
    backToChildren: 'ወደ ሕፃናት ተመለስ',
    childDetails: 'የሕፃን ዝርዝሮች',
  }
}

export default function ChildViewDetailsPage() {
  const params = useParams()
  const childId = params.id as string
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translations[language as keyof typeof translations]

  if (user?.role !== 'guardian') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{language === 'am' ? 'ደህና አለመድረስ' : 'Access Denied'}</h1>
          <p className="text-muted-foreground mb-6">
            {language === 'am' ? 'ይህ ገጽ ለወላጆች ብቻ ነው' : 'This page is only available for parents'}
          </p>
          <Link href="/dashboard">
            <Button>{language === 'am' ? 'ወደ ዳሽቦርድ ይሂዱ' : 'Go to Dashboard'}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/children">
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-primary">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.childDetails}</h1>
          </div>
        </div>

        {/* Content */}
        <ParentChildDetails childId={childId} />
      </div>
    </div>
  )
}
