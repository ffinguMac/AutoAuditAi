"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GitBranch,
  Star,
  Lock,
  Globe,
  Plus,
  Minus,
  FileText,
  Clock,
  GitPullRequest,
  XCircle,
  GitMerge,
  LogOut,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { user, repositories, pullRequests, selectedRepo, logout, selectRepository } = useAuth()
  const router = useRouter()

  const [prFilter, setPrFilter] = useState<"all" | "open" | "merged" | "closed">("all")
  const [expandedPRs, setExpandedPRs] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [auditingPRs, setAuditingPRs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <GitPullRequest className="w-4 h-4 text-green-500" />
      case "merged":
        return <GitMerge className="w-4 h-4 text-purple-500" />
      case "closed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <GitPullRequest className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "merged":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "closed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getItemDisplayName = (item: string) => {
    const itemNames: { [key: string]: string } = {
      new_endpoint: "새 엔드포인트",
      vulnerability: "취약점",
      auth: "인증",
      secrets: "시크릿",
      pii: "개인정보",
      new_packages: "새 패키지",
      security_patch: "보안 패치",
    }
    return itemNames[item] || item
  }

  const togglePRExpansion = (prId: string) => {
    const newExpanded = new Set(expandedPRs)
    if (newExpanded.has(prId)) {
      newExpanded.delete(prId)
    } else {
      newExpanded.add(prId)
    }
    setExpandedPRs(newExpanded)
  }

  const filteredPullRequests = pullRequests.filter((pr) => {
    if (prFilter === "all") return true
    return pr.status === prFilter
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  const handleAudit = async (prId: string, prNumber: number) => {
    setAuditingPRs((prev) => new Set([...prev, prId]))
    // Simulate audit process
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setAuditingPRs((prev) => {
      const newSet = new Set(prev)
      newSet.delete(prId)
      return newSet
    })
    console.log(`Auditing completed for PR #${prNumber}`)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 h-screen">
          <div className="p-6 h-full overflow-y-auto scrollbar-hide">
            {/* User Profile */}
            <div className="flex items-center space-x-3 mb-6">
              <Avatar className="w-10 h-10">

                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{user.name}</h3>
                <p className="text-gray-400 text-sm">@{user.githubUsername}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mb-8 border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => router.push("/rules")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Rules
            </Button>

            {/* Repositories */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <GitBranch className="w-4 h-4 mr-2" />
                Repositories ({repositories.length})
              </h4>
              <div className="space-y-2">
                {repositories.map((repo) => (
                  <Card
                    key={repo.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedRepo?.id === repo.id
                        ? "bg-blue-500/20 border-blue-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => selectRepository(repo)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-white font-medium text-sm truncate overflow-hidden whitespace-nowrap">{repo.name}</h5>
                        <div className="flex items-center space-x-1">
                          {repo.isPrivate ? (
                            <Lock className="w-3 h-3 text-gray-400" />
                          ) : (
                            <Globe className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{repo.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-400">{repo.language}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Star className="w-3 h-3" />
                          <span>{repo.stars}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 h-screen overflow-y-auto scrollbar-hide">
          {selectedRepo ? (
            <div>
              {/* Repository Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{selectedRepo.fullName}</h1>
                    <p className="text-gray-300">{selectedRepo.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="border-white/20 text-white">
                      {selectedRepo.isPrivate ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Star className="w-4 h-4" />
                      <span>{selectedRepo.stars}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pull Requests */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <GitPullRequest className="w-6 h-6 mr-2" />
                    Pull Requests ({filteredPullRequests.length})
                  </h2>

                  {/* Filter Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={prFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrFilter("all")}
                      className={
                        prFilter === "all"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                      }
                    >
                      All ({pullRequests.length})
                    </Button>
                    <Button
                      variant={prFilter === "open" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrFilter("open")}
                      className={
                        prFilter === "open"
                          ? "bg-green-500 hover:bg-green-600"
                          : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                      }
                    >
                      Open ({pullRequests.filter((pr) => pr.status === "open").length})
                    </Button>
                    <Button
                      variant={prFilter === "merged" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrFilter("merged")}
                      className={
                        prFilter === "merged"
                          ? "bg-purple-500 hover:bg-purple-600"
                          : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                      }
                    >
                      Merged ({pullRequests.filter((pr) => pr.status === "merged").length})
                    </Button>
                    <Button
                      variant={prFilter === "closed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrFilter("closed")}
                      className={
                        prFilter === "closed"
                          ? "bg-red-500 hover:bg-red-600"
                          : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                      }
                    >
                      Closed ({pullRequests.filter((pr) => pr.status === "closed").length})
                    </Button>
                  </div>
                </div>

                {filteredPullRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPullRequests.map((pr) => (
                      <div key={pr.id}>
                        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 mt-1">{getStatusIcon(pr.status)}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 mr-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="text-white font-semibold text-lg">
                                        #{pr.number} {pr.title}
                                      </h3>
                                      {pr.isAudited && (
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          검사완료
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-300 mb-3">{pr.description}</p>
                                  </div>
                                  <div className="flex space-x-3 flex-col items-end space-y-2">
                                    <Badge className={getStatusColor(pr.status)}>{pr.status}</Badge>
                                    {pr.isAudited ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                        onClick={() => togglePRExpansion(pr.id)}
                                      >
                                        {expandedPRs.has(pr.id) ? (
                                          <>
                                            접기 <ChevronUp className="w-4 h-4 ml-1" />
                                          </>
                                        ) : (
                                          <>
                                            결과 <ChevronDown className="w-4 h-4 ml-1" />
                                          </>
                                        )}
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                        onClick={() => handleAudit(pr.id, pr.number)}
                                        disabled={auditingPRs.has(pr.id)}
                                      >
                                        {auditingPRs.has(pr.id) ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            진행 중...
                                          </>
                                        ) : (
                                          "검사"
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage
                                          src={pr.author.avatar || "/placeholder.svg"}
                                          alt={pr.author.name}
                                        />
                                        <AvatarFallback className="text-xs">{pr.author.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-gray-400 text-sm">{pr.author.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                                      <Clock className="w-3 h-3" />
                                      <span>{new Date(pr.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-1 text-green-400">
                                      <Plus className="w-3 h-3" />
                                      <span>{pr.additions}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-red-400">
                                      <Minus className="w-3 h-3" />
                                      <span>{pr.deletions}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-400">
                                      <FileText className="w-3 h-3" />
                                      <span>{pr.changedFiles} files</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Audit Results Table */}
                        {pr.isAudited && expandedPRs.has(pr.id) && pr.auditResults && (
                          <Card className="bg-white/5 border-white/10 mt-2">
                            <CardContent className="p-6">
                              <h4 className="text-white font-semibold mb-4 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                검사 결과
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-white/10">
                                      <th className="text-left text-gray-300 font-medium py-3 px-4">검사항목</th>
                                      <th className="text-left text-gray-300 font-medium py-3 px-4">결과</th>
                                      <th className="text-left text-gray-300 font-medium py-3 px-4">정확도</th>
                                      <th className="text-left text-gray-300 font-medium py-3 px-4">사유</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pr.auditResults.map((result, index) => (
                                      <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4">
                                          <span className="text-white font-medium">
                                            {getItemDisplayName(result.item)}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4">
                                          <Badge
                                            className={
                                              result.result
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-green-500/10 text-green-400 border-green-500/20"
                                            }
                                          >
                                            {result.result ? "True" : "False"}
                                          </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-700 rounded-full h-2">
                                              <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                style={{ width: `${result.accuracy}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-gray-300 text-sm">{result.accuracy}%</span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4">
                                          <span className="text-gray-300 text-sm">{result.reason}</span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-12 text-center">
                      <GitPullRequest className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">
                        {prFilter === "all" ? "No Pull Requests" : `No ${prFilter} Pull Requests`}
                      </h3>
                      <p className="text-gray-400">
                        {prFilter === "all"
                          ? "This repository doesn't have any pull requests yet."
                          : `This repository doesn't have any ${prFilter} pull requests.`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="bg-white/5 border-white/10 max-w-md">
                <CardContent className="p-12 text-center">
                  <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Welcome to Auto Audit</h2>
                  <p className="text-gray-300 mb-6">
                    Select a repository from the sidebar to view its pull requests and start auditing.
                  </p>
                  <p className="text-gray-400 text-sm">
                    You have {repositories.length} repositories connected to your account.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
