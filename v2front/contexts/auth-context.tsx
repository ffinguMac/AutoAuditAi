"use client"

import {createContext, useContext, useState, useEffect, type ReactNode} from "react"

interface User {
    id: string
    name: string
    email: string
    avatar: string
    githubUsername: string
    github_token?: string
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

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string>("")
    const [repositories, setRepositories] = useState<Repository[]>([])
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([])

    const login = async () => {
        // 실제 GitHub OAuth 로그인 URL로 이동
        window.location.href = "http://localhost:8000/auth/github/login"
    }

    const logout = () => {
        setUser(null)
        setRepositories([])
        setSelectedRepo(null)
        setPullRequests([])
    }

    const fetchRepositories = async (token: string) => {
        try {
            const response = await fetch("http://localhost:8000/repos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!response.ok) throw new Error("Failed to fetch repositories")
            const repos = await response.json()
            setRepositories(
                repos.map((repo: any) => ({
                    id: repo.full_name,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stars,
                    isPrivate: repo.is_private,
                }))
            )
        } catch (error) {
            console.error("Repository fetch error:", error)
        }
    }

    const fetchPullRequests = async (repoId: string, token: string) => {
        try {
            const response = await fetch(`http://localhost:8000/repos/${repoId}/pulls`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!response.ok) throw new Error("Failed to fetch pull requests")
            const prs = await response.json()
            setPullRequests(
                prs.map((pr: any) => ({
                    id: pr.id.toString(),
                    number: pr.number,
                    title: pr.title,
                    description: pr.description,
                    author: {
                        name: pr.author.name,
                        avatar: pr.author.avatar,
                    },
                    status: pr.state,
                    createdAt: pr.created_at,
                    updatedAt: pr.updated_at,
                    additions: pr.additions,
                    deletions: pr.deletions,
                    changedFiles: pr.changed_files,
                }))
            )
        } catch (error) {
            console.error("Pull Request fetch error:", error)
        }
    }

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
            setToken(token)
            await fetchRepositories(token)
        } catch (error) {
            console.error("[AuthContext] 사용자 정보를 불러오는 데 실패했습니다:", error)
        }
    }

    const selectRepository = async (repo: Repository) => {
        setSelectedRepo(repo)
        await fetchPullRequests(repo.id, token)
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
