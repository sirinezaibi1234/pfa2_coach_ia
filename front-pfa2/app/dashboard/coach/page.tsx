'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ImagePlus, Send, X } from 'lucide-react'
import { aiService } from '@/services/ai.service'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  imageName?: string
  timestamp: string
}

type PendingImage = {
  name: string
  file: File
  dataUrl: string
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
  const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const buildCoachPrompt = (
    userText: string,
    visionResult: string,
    sentiment: string,
    history: Message[]
  ) => {
    const recentHistory = history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    const objective = user?.objectives?.[0]?.type || 'maintenance'

    return [
      'You are an expert AI fitness and nutrition coach.',
      'Provide practical, safe, motivating, and personalized coaching advice.',
      'If food photo analysis is present, estimate calories and suggest meal improvements with concrete alternatives.',
      'Keep the answer concise and actionable.',
      'Respond in French.',
      '',
      'USER PROFILE:',
      `- Username: ${user?.username || 'User'}`,
      `- Age: ${user?.age || 'unknown'}`,
      `- Gender: ${user?.gender || 'unknown'}`,
      `- Height: ${user?.height || 'unknown'} cm`,
      `- Weight: ${user?.weight || 'unknown'} kg`,
      `- Fitness level: ${user?.fitnessLevel || 'unknown'}`,
      `- Objective: ${objective}`,
      `- Medical conditions: ${(user?.medicalConditions || []).join(', ') || 'none'}`,
      `- Dietary restrictions: ${(user?.dietaryRestrictions || []).join(', ') || 'none'}`,
      '',
      'RECENT CHAT HISTORY:',
      recentHistory || 'No prior history',
      '',
      `USER SENTIMENT SIGNAL: ${sentiment || 'unknown'}`,
      '',
      `USER MESSAGE: ${userText || '(no text, image sent)'}`,
      '',
      `VISION ANALYSIS (if any): ${visionResult || 'none'}`,
      '',
      'Output format:',
      '- Coaching summary (2-4 lines)',
      '- Calories estimate (if meal/photo involved)',
      '- Meal recommendations',
      '- Next action for today',
    ].join('\n')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage({
        name: file.name,
        file,
        dataUrl: String(reader.result),
      })
    }
    reader.readAsDataURL(file)

    event.target.value = ''
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return

    const messageContent = inputValue.trim() || 'Please analyze this photo and give me coaching advice.'

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: messageContent,
      imageUrl: selectedImage?.dataUrl,
      imageName: selectedImage?.name,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    const imageForRequest = selectedImage
    setSelectedImage(null)
    setIsLoading(true)

    try {
      let visionResult = ''
      if (imageForRequest?.file) {
        const vision = await aiService.vision(
          imageForRequest.file,
          'Analyze this meal photo. Estimate calories and macros, then suggest healthier alternatives and portion adjustments.'
        )
        visionResult = vision.response || ''
      }

      let sentimentResult = ''
      if (messageContent.trim()) {
        try {
          const sentiment = await aiService.sentiment(messageContent)
          sentimentResult = sentiment.response || ''
        } catch {
          sentimentResult = ''
        }
      }

      const coachPrompt = buildCoachPrompt(
        messageContent,
        visionResult,
        sentimentResult,
        [...messages, userMessage]
      )
      const textResponse = await aiService.text(coachPrompt)

      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: textResponse.response || 'Je n ai pas pu generer de reponse pour le moment.',
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content:
          err instanceof Error
            ? `Je rencontre un probleme de connexion AI: ${err.message}`
            : 'Je rencontre un probleme de connexion AI, reessaie dans quelques secondes.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Fitness Coach</h1>
        <p className="text-muted-foreground">
          Chat with your AI coach for workout, nutrition, calorie estimates from photos, and daily recommendations
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
                {message.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.imageUrl}
                      alt={message.imageName || 'Uploaded image'}
                      className="rounded-md max-h-56 w-full object-cover border border-border/50"
                    />
                    {message.imageName && (
                      <p className="text-[11px] mt-1 opacity-80">{message.imageName}</p>
                    )}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
          {selectedImage && (
            <div className="mb-3 p-3 border border-border rounded-lg bg-muted/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedImage.dataUrl}
                    alt={selectedImage.name}
                    className="h-16 w-16 rounded-md object-cover border border-border"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Photo ready</p>
                    <p className="text-xs text-muted-foreground">{selectedImage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove selected image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={isLoading}
              className="px-3 py-2 border border-input bg-background rounded-lg hover:bg-muted/70 transition disabled:opacity-50"
              title="Upload photo"
            >
              <ImagePlus size={18} />
            </button>
            <input
              type="text"
              placeholder="Ask a question or send a photo for feedback..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
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
              disabled={isLoading || (!inputValue.trim() && !selectedImage)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Upload a meal photo and ask for calories, macros, and meal recommendations
          </p>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Give me today workout advice based on my profile',
            'Analyze my meal strategy for weight loss',
            'I feel tired and unmotivated, what should I do?',
            'How should I adjust sleep and recovery this week?',
          ].map(
            suggestion => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
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
