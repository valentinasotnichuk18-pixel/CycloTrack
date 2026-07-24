import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AuthenticatedApp } from '../App'
import { useAuth } from '@/lib/AuthContext'

vi.mock('@/lib/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const queryClient = new QueryClient()

function renderWithProviders(ui) {
  return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
  )
}

describe('AuthenticatedApp', () => {
  it('shows a loading spinner while auth state is loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoadingAuth: true })
    const { container } = renderWithProviders(<AuthenticatedApp />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('shows the login form when the user is not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoadingAuth: false })
    renderWithProviders(<AuthenticatedApp />)
    expect(screen.getByText('CycloTrack')).toBeTruthy()
    expect(screen.getByText('Увійти')).toBeTruthy()
  })
})