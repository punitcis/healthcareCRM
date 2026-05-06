'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Eye, EyeOff, Phone, Shield, AlertCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()

  const demoAccounts = [
    { email: 'maria.rossi@crisislink.it', password: 'password123', name: 'Maria Rossi', role: t.roles.operator },
    { email: 'luca.bianchi@crisislink.it', password: 'password123', name: 'Luca Bianchi', role: t.roles.operator },
    { email: 'anna.ferrari@crisislink.it', password: 'password123', name: 'Anna Ferrari', role: t.roles.coordinator },
    { email: 'paolo.ricci@crisislink.it', password: 'password123', name: 'Dr. Paolo Ricci', role: t.roles.supervisor },
    { email: 'admin@crisislink.it', password: 'password123', name: 'Admin Sistema', role: t.roles.admin },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(t.login.errorCredentials)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const fillDemo = (account: typeof demoAccounts[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLang(lang === 'en' ? 'it' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur text-white text-xs font-semibold"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Italiano' : 'English'}
        </button>
      </div>

      <div className="relative w-full max-w-5xl flex gap-6 items-start">
        {/* Left: Branding */}
        <div className="hidden lg:flex flex-col justify-center flex-1 text-white py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl backdrop-blur">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">CrisisLink</h1>
              <p className="text-blue-200 text-sm">Helpline Management Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            {t.login.brandTitle}
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            {t.login.brandDesc}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Phone, label: t.login.feature1Label, desc: t.login.feature1Desc },
              { icon: Shield, label: t.login.feature2Label, desc: t.login.feature2Desc },
              { icon: AlertCircle, label: t.login.feature3Label, desc: t.login.feature3Desc },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-4 bg-white/10 rounded-xl backdrop-blur">
                <div className="flex items-center justify-center w-9 h-9 bg-cyan-400/30 rounded-lg shrink-0">
                  <Icon className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login form */}
        <div className="w-full lg:w-[420px] space-y-4">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 text-white mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-xl font-bold">CrisisLink</span>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">{t.login.title}</CardTitle>
              <p className="text-sm text-gray-500">{t.login.subtitle}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">{t.login.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.login.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">{t.login.passwordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t.login.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.login.submitting}
                    </span>
                  ) : (
                    t.login.submit
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo accounts */}
          <Card className="shadow-xl border border-blue-200 bg-blue-50/80 backdrop-blur">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <h3 className="text-sm font-semibold text-blue-900">{t.login.demoTitle}</h3>
              </div>
              <p className="text-xs text-blue-700 mb-3">{t.login.demoSubtitle}</p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => fillDemo(account)}
                    className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-800">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      account.role === t.roles.admin ? 'bg-purple-100 text-purple-700' :
                      account.role === t.roles.supervisor ? 'bg-red-100 text-red-700' :
                      account.role === t.roles.coordinator ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {account.role}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2 text-center opacity-70">{t.login.demoPassword}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
