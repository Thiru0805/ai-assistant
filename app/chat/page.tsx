'use client'
import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I assist you today?' }
  ])
  const [input, setInput] = useState('')

  if (!session) {
    return (
      <div className="p-4 text-center">
        <button onClick={() => signIn('google')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign in with Google
        </button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessages([...newMessages, { role: 'assistant', content: data.content }])
    } else {
      setMessages([...newMessages, { role: 'assistant', content: 'Error: ' + (data.error || 'Something went wrong') }])
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="text-right mb-4">
        <span>Welcome {session.user?.name}</span>{' '}
        <button onClick={() => signOut()} className="text-sm underline text-red-500">Logout</button>
      </div>
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong> {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="border p-2 flex-1" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  )
}
