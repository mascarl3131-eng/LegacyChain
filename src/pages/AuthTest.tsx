import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthTest() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setMessage('Erreur: ' + error.message)
    } else {
      setMessage('✅ Inscription réussie ! Vérifiez votre email.')
    }
  }

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage('Erreur: ' + error.message)
    } else if (data.user) {
      setUser(data.user)
      setMessage('✅ Connecté ! Bienvenue ' + data.user.email)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('👋 Déconnecté')
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      setMessage('Erreur Google: ' + error.message)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>🔐 Test Supabase Auth</h1>

      {user ? (
        <div>
          <p>Connecté en tant que : <strong>{user.email}</strong></p>
          <button onClick={handleLogout}>Se déconnecter</button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
          <button onClick={handleSignup} style={{ marginRight: 10 }}>
            S'inscrire
          </button>
          <button onClick={handleLogin}>
            Se connecter
          </button>
          <br />
          <button 
            onClick={handleGoogleLogin}
            style={{ background: '#DB4437', color: 'white', padding: 10, marginTop: 10, width: '100%' }}
          >
            🔴 Se connecter avec Google
          </button>
        </div>
      )}

      {message && (
        <p style={{ marginTop: 20, padding: 10, background: '#f0f0f0', borderRadius: 5 }}>
          {message}
        </p>
      )}
    </div>
  )
}