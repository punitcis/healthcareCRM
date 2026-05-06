'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import en, { Translations } from '@/lib/i18n/en'
import it from '@/lib/i18n/it'

type Lang = 'en' | 'it'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('crisislink-lang') as Lang | null
    if (saved === 'en' || saved === 'it') setLangState(saved)
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('crisislink-lang', newLang)
  }

  const t = lang === 'it' ? it : en

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
