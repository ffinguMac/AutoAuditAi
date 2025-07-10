"use client"

import {createContext, useContext, useState, type ReactNode} from "react"

interface User {
    id: string
    name: string
    email: string
    avatar: string
    githubUsername: string
}

interface Repository {
    id: string
    name: string
    fullName: string
    description: string
    language: string
    stars: number
    isPrivate: boolean
}

interface AuditResult {
    item: string
    result: boolean
    accuracy: number
    reason: string
}

interface PullRequest {
    id: string
    number: number
    title: string
    description: string
    author: {
        name: string
        avatar: string
    }
    status: "open" | "closed" | "merged"
    createdAt: string
    updatedAt: string
    additions: number
    deletions: number
    changedFiles: number
    isAudited?: boolean
    auditResults?: AuditResult[]
}

interface AuthContextType {
    user: User | null
    repositories: Repository[]
    pullRequests: PullRequest[]
    selectedRepo: Repository | null
    login: () => Promise<void>
    logout: () => void
    selectRepository: (repo: Repository) => void
    setUserFromToken: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data
// const mockUser: User = {
//     id: "1",
//     name: "John Doe",
//     email: "john.doe@example.com",
//     avatar: "/placeholder.svg?height=40&width=40",
//     githubUsername: "johndoe",
// }

const mockRepositories: Repository[] = [
    {
        id: "1",
        name: "auto-audit-frontend",
        fullName: "johndoe/auto-audit-frontend",
        description: "Frontend application for Auto Audit platform",
        language: "TypeScript",
        stars: 24,
        isPrivate: false,
    },
    {
        id: "2",
        name: "compliance-checker",
        fullName: "johndoe/compliance-checker",
        description: "Automated compliance checking tool",
        language: "Python",
        stars: 156,
        isPrivate: true,
    },
    {
        id: "3",
        name: "audit-dashboard",
        fullName: "johndoe/audit-dashboard",
        description: "Real-time audit monitoring dashboard",
        language: "JavaScript",
        stars: 89,
        isPrivate: false,
    },
    {
        id: "4",
        name: "security-scanner",
        fullName: "johndoe/security-scanner",
        description: "Security vulnerability scanner",
        language: "Go",
        stars: 203,
        isPrivate: true,
    },
]

const mockAuditResults: AuditResult[] = [
    {
        item: "new_endpoint",
        result: true,
        accuracy: 95,
        reason: "새로운 API 엔드포인트 '/api/auth/oauth' 감지됨. 적절한 인증 미들웨어가 적용되어 있음.",
    },
    {
        item: "vulnerability",
        result: false,
        accuracy: 88,
        reason: "알려진 보안 취약점이 발견되지 않음. 사용된 라이브러리들이 최신 보안 패치를 적용한 상태임.",
    },
    {
        item: "auth",
        result: true,
        accuracy: 92,
        reason: "인증 로직 변경 감지. OAuth 2.0 구현이 보안 모범 사례를 따르고 있음.",
    },
    {
        item: "secrets",
        result: false,
        accuracy: 97,
        reason: "하드코딩된 시크릿이나 API 키가 발견되지 않음. 환경 변수 사용이 적절히 구현됨.",
    },
    {
        item: "pii",
        result: false,
        accuracy: 85,
        reason: "개인정보(PII) 노출 위험이 발견되지 않음. 데이터 마스킹 및 암호화가 적절히 적용됨.",
    },
    {
        item: "new_packages",
        result: true,
        accuracy: 90,
        reason: "새로운 패키지 'bcrypt@5.1.0' 추가됨. 보안 감사를 통과한 안전한 패키지임.",
    },
    {
        item: "security_patch",
        result: true,
        accuracy: 94,
        reason: "보안 패치가 포함됨. JWT 토큰 검증 로직이 강화되어 보안성이 향상됨.",
    },
]

const mockPullRequests: { [key: string]: PullRequest[] } = {
    "1": [
        {
            id: "pr-1",
            number: 42,
            title: "Add new authentication flow",
            description: "Implement OAuth 2.0 authentication with GitHub integration",
            author: {
                name: "Jane Smith",
                avatar: "/placeholder.svg?height=32&width=32",
            },
            status: "open",
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-16T14:20:00Z",
            additions: 245,
            deletions: 67,
            changedFiles: 8,
            isAudited: true,
            auditResults: mockAuditResults,
        },
        {
            id: "pr-2",
            number: 41,
            title: "Fix responsive design issues",
            description: "Resolve mobile layout problems and improve tablet experience",
            author: {
                name: "Mike Johnson",
                avatar: "/placeholder.svg?height=32&width=32",
            },
            status: "merged",
            createdAt: "2024-01-14T09:15:00Z",
            updatedAt: "2024-01-15T16:45:00Z",
            additions: 89,
            deletions: 34,
            changedFiles: 5,
            isAudited: false,
        },
        {
            id: "pr-3",
            number: 40,
            title: "Update dependencies",
            description: "Bump React to v18.2 and update other dependencies",
            author: {
                name: "Sarah Wilson",
                avatar: "/placeholder.svg?height=32&width=32",
            },
            status: "closed",
            createdAt: "2024-01-13T11:00:00Z",
            updatedAt: "2024-01-14T08:30:00Z",
            additions: 12,
            deletions: 8,
            changedFiles: 2,
            isAudited: false,
        },
    ],
    "2": [
        {
            id: "pr-4",
            number: 23,
            title: "Implement new compliance rules",
            description: "Add support for SOX and GDPR compliance checking",
            author: {
                name: "Alex Chen",
                avatar: "/placeholder.svg?height=32&width=32",
            },
            status: "open",
            createdAt: "2024-01-16T13:20:00Z",
            updatedAt: "2024-01-16T15:10:00Z",
            additions: 456,
            deletions: 123,
            changedFiles: 12,
            isAudited: true,
            auditResults: [
                {
                    item: "new_endpoint",
                    result: false,
                    accuracy: 91,
                    reason: "새로운 엔드포인트가 감지되지 않음. 기존 API 구조 유지됨.",
                },
                {
                    item: "vulnerability",
                    result: true,
                    accuracy: 87,
                    reason: "잠재적 SQL 인젝션 취약점 발견. 파라미터 검증 로직 강화 필요.",
                },
                {
                    item: "auth",
                    result: false,
                    accuracy: 93,
                    reason: "인증 관련 변경사항 없음. 기존 인증 시스템 유지됨.",
                },
                {
                    item: "secrets",
                    result: false,
                    accuracy: 96,
                    reason: "시크릿 노출 위험 없음. 모든 민감 정보가 적절히 보호됨.",
                },
                {
                    item: "pii",
                    result: true,
                    accuracy: 89,
                    reason: "개인정보 처리 로직 추가됨. GDPR 준수를 위한 데이터 익명화 구현.",
                },
                {
                    item: "new_packages",
                    result: false,
                    accuracy: 88,
                    reason: "새로운 패키지 추가되지 않음. 기존 의존성만 사용됨.",
                },
                {
                    item: "security_patch",
                    result: true,
                    accuracy: 92,
                    reason: "보안 패치 적용됨. 데이터 검증 로직이 강화되어 보안성 향상.",
                },
            ],
        },
    ],
    "3": [
        {
            id: "pr-5",
            number: 18,
            title: "Add real-time notifications",
            description: "Implement WebSocket-based real-time notifications for audit events",
            author: {
                name: "David Brown",
                avatar: "/placeholder.svg?height=32&width=32",
            },
            status: "open",
            createdAt: "2024-01-15T16:45:00Z",
            updatedAt: "2024-01-16T12:30:00Z",
            additions: 234,
            deletions: 45,
            changedFiles: 7,
            isAudited: false,
        },
    ],
    "4": [
        {
            id: "pr-6",
            number: 31,
            title: "Optimize scanning performance",
            description: "Improve scanning speed by 40% through parallel processing",
            author: {
                name: "Lisa Garcia",
                avatar: "/placeholder.svg?height=32&width=32",
            },
            status: "merged",
            createdAt: "2024-01-14T14:20:00Z",
            updatedAt: "2024-01-15T10:15:00Z",
            additions: 178,
            deletions: 92,
            changedFiles: 6,
            isAudited: false,
        },
    ],
}

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)

    const login = async () => {
        // 실제 GitHub OAuth 로그인 URL로 이동
        window.location.href = "http://localhost:8000/auth/github/login"
    }

    const logout = () => {
        setUser(null)
        setSelectedRepo(null)
    }

    const selectRepository = (repo: Repository) => {
        setSelectedRepo(repo)
    }

    const repositories = user ? mockRepositories : []
    const pullRequests = selectedRepo ? mockPullRequests[selectedRepo.id] || [] : []

    // Set user from token by fetching user data from backend
    const setUserFromToken = async (token: string) => {
        try {
            const response = await fetch("http://localhost:8000/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                throw new Error("Failed to fetch user data")
            }
            const userData = await response.json()
            setUser(userData)
        } catch (error) {
            console.error("[AuthContext] 사용자 정보를 불러오는 데 실패했습니다:", error)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                repositories,
                pullRequests,
                selectedRepo,
                login,
                logout,
                selectRepository,
                setUserFromToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
