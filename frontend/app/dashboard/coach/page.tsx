'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Send } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function CoachPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${user?.username}! 👋 I'm your personal AI fitness coach. I'm here to help you with workout advice, nutrition guidance, and motivation to reach your goals. What would you like to discuss today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response with a small delay
    setTimeout(() => {
      const responses: Record<string, string> = {
        workout:
          "Great question! For your fitness level, I'd recommend a mix of strength training and cardio. Start with 3 days a week and gradually increase. Would you like a specific workout plan?",
        nutrition:
          "Nutrition is key! Based on your goals, here are my recommendations: eat more protein, stay hydrated, and focus on whole foods. What specific meals would you like help with?",
        motivation:
          "You've got this! Remember, consistency is more important than perfection. Small steps every day lead to big results. Keep pushing and celebrate your progress! 💪",
        rest:
          "Rest days are crucial for recovery! Make sure you're getting 7-9 hours of sleep and taking at least 1-2 rest days per week. Your body needs time to rebuild and get stronger.",
        weight:
          "Weight loss is a gradual process - aim for 0.5-1 kg per week. Track your calories, eat in a slight deficit, and stay active. You're doing great so far!",
        default:
          "That's a great question! To give you the best advice, I need to know more about your specific situation. Could you provide more details about what you're asking?",
      }

      let response = responses.default

      const input = inputValue.toLowerCase()
      if (input.includes('workout') || input.includes('exercise')) {
        response = responses.workout
      } else if (input.includes('nutrition') || input.includes('eat') || input.includes('food')) {
        response = responses.nutrition
      } else if (input.includes('motivat') || input.includes('tired')) {
        response = responses.motivation
      } else if (input.includes('rest') || input.includes('sleep')) {
        response = responses.rest
      } else if (input.includes('weight')) {
        response = responses.weight
      }

      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 500)
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Fitness Coach</h1>
        <p className="text-muted-foreground">
          Chat with your personal AI coach for personalized advice and motivation
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-muted text-foreground rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask me anything about fitness, nutrition, or training..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, or Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {['💪 Workout advice', '🥗 Nutrition tips', '😴 Rest & recovery', '🎯 Goal tracking'].map(
            suggestion => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion.split(' ')[1])}
                className="px-3 py-2 bg-muted text-foreground text-sm rounded-full hover:bg-muted/80 transition border border-border"
              >
                {suggestion}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
