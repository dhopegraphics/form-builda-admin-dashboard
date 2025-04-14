"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { redirect } from "next/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()

  if (!currentUser) {
    redirect("/login")
  }

  return <>{children}</>
}
