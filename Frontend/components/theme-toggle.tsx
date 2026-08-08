'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0" aria-label="Toggle theme">
        <Sun size={18} />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="w-9 h-9 p-0"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  )
}
