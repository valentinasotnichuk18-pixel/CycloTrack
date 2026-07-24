import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../pages/Login'

describe('Login', () => {
  it('renders the login form', () => {
    render(<Login />)
    expect(screen.getByText('CycloTrack')).toBeTruthy()
    expect(screen.getByPlaceholderText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('Пароль')).toBeTruthy()
    expect(screen.getByText('Увійти')).toBeTruthy()
    expect(screen.getByText('Зареєструватись')).toBeTruthy()
  })
})