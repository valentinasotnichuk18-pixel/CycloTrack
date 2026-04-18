import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        setLoading(false)
    }

    const handleRegister = async () => {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setError('Перевір пошту для підтвердження!')
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">CycloTrack</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border rounded-lg p-3 mb-3"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border rounded-lg p-3 mb-3"
                />

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white rounded-lg p-3 mb-2"
                >
                    {loading ? 'Завантаження...' : 'Увійти'}
                </button>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full border border-purple-600 text-purple-600 rounded-lg p-3"
                >
                    Зареєструватись
                </button>
            </div>
        </div>
    )
}