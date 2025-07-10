// app/oauth/page.tsx (App Router 기준)
"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function OAuthCallback() {
  const { setUserFromToken } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")

  useEffect(() => {
    const handleOAuth = async () => {
      if (!token) return
      await setUserFromToken(token)
      router.replace("/dashboard")
    }
    handleOAuth()
  }, [token])

  return <p>GitHub 인증 중입니다. 잠시만 기다려주세요...</p>
}