"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useChildren } from "@/lib/children-context"
import { useUser } from "@/lib/user-context"
import { useLanguage } from "@/lib/language-context"
import { getChildren, type Child } from "@/lib/parent-api"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Syringe } from "lucide-react"

interface ParentViewChildrenProps {
  childrenData?: Child[]
}

export function ParentViewChildren({ childrenData }: ParentViewChildrenProps) {
  const { user } = useUser()
  const { language } = useLanguage()
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // If we received data from props, use it properly
    if (childrenData) {
      setChildren(childrenData)
      setIsLoading(false)
      return
    }

    const fetchChildren = async () => {
      try {
        console.log('[ParentViewChildren] Fetching children...')
        const { data, error } = await getChildren()
        console.log('[ParentViewChildren] API Response:', { data, error })
        if (!error && data) {
          console.log('[ParentViewChildren] Setting children:', data)
          setChildren(data)
        } else {
          console.log('[ParentViewChildren] No children or error:', error)
        }
      } catch (err) {
        console.error("[ParentViewChildren] Failed to fetch children:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchChildren()
  }, [childrenData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log('[ParentViewChildren] Refreshing children...')
      const { data, error } = await getChildren()
      console.log('[ParentViewChildren] Refresh API Response:', { data, error })
      if (!error && data) {
        console.log('[ParentViewChildren] Updating children:', data)
        setChildren(data)
      }
    } catch (err) {
      console.error("[ParentViewChildren] Failed to refresh children:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const getChildStatus = (child: Child) => {
    const today = new Date()
    const checkOverdue = (v: any) => {
      if (v.status === "overdue") return true
      if (v.status === "pending" && v.scheduled_date) {
        const dueDate = new Date(v.scheduled_date)
        return !isNaN(dueDate.getTime()) && dueDate < today
      }
      return false
    }

    const hasOverdue = child.vaccination_records?.some(checkOverdue)
    const hasPending = child.vaccination_records?.some(v => v.status === "pending" && !checkOverdue(v))

    if (hasOverdue) return "overdue"
    if (hasPending) return "due"
    return "uptodate"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {language === "am" ? "ክትባት ያለፈበት" : "Overdue"}
          </Badge>
        )
      case "due":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 flex items-center gap-1">
            <Syringe className="h-3 w-3" />
            {language === "am" ? "የሚወሰድ" : "Due"}
          </Badge>
        )
      default:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {language === "am" ? "ሁሉም ተወስዷል" : "Up to Date"}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {language === "am" ? "የሚያመለክተዋት ልጆች" : "Your Children"}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {language === "am" ? "መው ደህና" : "Refresh"}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {children.map((child) => (
          <Card key={child.id} className="p-5 hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {child.first_name?.charAt(0) || "C"}
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {child.first_name && child.last_name
                      ? `${child.first_name} ${child.last_name}`
                      : (child.name || (language === "am" ? "ያልታወቀ ስም" : "Unknown Name"))}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="font-medium">{language === "am" ? "የልደት ቀን" : "DOB"}:</span>
                      {child.date_of_birth ? (isNaN(new Date(child.date_of_birth).getTime()) ? child.date_of_birth : new Date(child.date_of_birth).toLocaleDateString()) : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                      <span className="font-medium">{language === "am" ? "ጾታ" : "Gender"}:</span>
                      {child.sex === "male" ? (language === "am" ? "ወንድ" : "Male") : language === "am" ? "ሴት" : "Female"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="font-medium">{language === "am" ? "መታወቂያ" : "ID"}:</span>
                      <span className="font-mono text-xs">{child.id}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-col sm:flex-row">
                {getStatusBadge(getChildStatus(child))}
                <Link href={`/dashboard/children/${child.id}`} className="w-full md:w-auto">
                  <Button variant="outline" className="w-full md:w-auto text-primary border-primary hover:bg-primary/5">
                    {language === "am" ? "ዝርዝር መመልከት" : "View Details"}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {children.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            {language === "am" ? "ምንም ተመዝግቦ ዳግመኛ ላይ ያለ ልጅ የለም" : "No children registered yet"}
          </p>
        </Card>
      )}
    </div>
  )
}
