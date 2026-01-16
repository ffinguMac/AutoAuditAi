"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface Rule {
  id: string
  name: string
  description: string
  type: "security" | "compliance" | "quality"
  enabled: boolean
}

export default function RulesPage() {
  const router = useRouter()
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      name: "SQL Injection Detection",
      description: "Detect potential SQL injection vulnerabilities",
      type: "security",
      enabled: true,
    },
    {
      id: "2",
      name: "GDPR Compliance Check",
      description: "Ensure GDPR compliance for personal data handling",
      type: "compliance",
      enabled: true,
    },
    {
      id: "3",
      name: "Code Quality Standards",
      description: "Check code quality and best practices",
      type: "quality",
      enabled: false,
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    type: "security" as const,
  })

  const [modifiedPrompt, setModifiedPrompt] = useState(`
당신은 코드 보안 및 컴플라이언스 전문가입니다. 다음 규칙들을 기반으로 Pull Request를 검사해주세요:

활성화된 규칙:
${rules
  .filter((rule) => rule.enabled)
  .map((rule) => `- ${rule.name}: ${rule.description}`)
  .join("\n")}

각 규칙에 대해 다음 형식으로 응답해주세요:
- 검사 항목
- 결과 (True/False)
- 정확도 (0-100%)
- 상세 사유

특히 보안 취약점, 개인정보 노출, 새로운 엔드포인트, 인증 관련 변경사항을 중점적으로 검사해주세요.
  `)

  const addRule = () => {
    if (newRule.name && newRule.description) {
      const rule: Rule = {
        id: Date.now().toString(),
        name: newRule.name,
        description: newRule.description,
        type: newRule.type,
        enabled: true,
      }
      setRules([...rules, rule])
      setNewRule({ name: "", description: "", type: "security" })
      updatePrompt([...rules, rule])
    }
  }

  const removeRule = (id: string) => {
    const updatedRules = rules.filter((rule) => rule.id !== id)
    setRules(updatedRules)
    updatePrompt(updatedRules)
  }

  const toggleRule = (id: string) => {
    const updatedRules = rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    setRules(updatedRules)
    updatePrompt(updatedRules)
  }

  const updatePrompt = (currentRules: Rule[]) => {
    const activeRules = currentRules.filter((rule) => rule.enabled)
    setModifiedPrompt(`
당신은 코드 보안 및 컴플라이언스 전문가입니다. 다음 규칙들을 기반으로 Pull Request를 검사해주세요:

활성화된 규칙:
${activeRules.map((rule) => `- ${rule.name}: ${rule.description}`).join("\n")}

각 규칙에 대해 다음 형식으로 응답해주세요:
- 검사 항목
- 결과 (True/False)
- 정확도 (0-100%)
- 상세 사유

특히 보안 취약점, 개인정보 노출, 새로운 엔드포인트, 인증 관련 변경사항을 중점적으로 검사해주세요.
    `)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "security":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "compliance":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "quality":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const handleSave = () => {
    // TODO: Save rules to backend
    console.log("Saving rules:", rules)
    router.push("/dashboard")
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Settings className="w-8 h-8 mr-3" />
                Manage Rules
              </h1>
              <p className="text-gray-300 mt-1">Configure audit rules and customize inspection criteria</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Rules Management */}
            <div className="space-y-6">
              {/* Rule Input */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Rule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rule Name</label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="Enter rule name"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <Textarea
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      placeholder="Describe what this rule checks for"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newRule.type}
                      onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
                    >
                      <option value="security">Security</option>
                      <option value="compliance">Compliance</option>
                      <option value="quality">Quality</option>
                    </select>
                  </div>
                  <Button
                    onClick={addRule}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </CardContent>
              </Card>

              {/* Rules List */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Current Rules ({rules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {rules.map((rule) => (
                      <Card
                        key={rule.id}
                        className={`transition-all duration-200 ${
                          rule.enabled ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 opacity-60"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-white font-medium">{rule.name}</h4>
                                <Badge className={getTypeColor(rule.type)}>{rule.type}</Badge>
                              </div>
                              <p className="text-gray-300 text-sm">{rule.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRule(rule.id)}
                                className={`text-xs ${
                                  rule.enabled
                                    ? "text-green-400 hover:text-green-300"
                                    : "text-gray-400 hover:text-gray-300"
                                }`}
                              >
                                {rule.enabled ? "Enabled" : "Disabled"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRule(rule.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Modified Prompt */}
            <div>
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Generated Audit Prompt</CardTitle>
                  <p className="text-gray-300 text-sm">
                    This prompt will be used by the AI to audit your pull requests
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {modifiedPrompt}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent px-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
