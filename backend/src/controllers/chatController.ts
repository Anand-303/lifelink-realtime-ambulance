import { Request, Response } from 'express';
import axios from 'axios';
import AmbulanceRequest from '../models/AmbulanceRequest';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

type ChatAction =
  | { type: 'navigate'; label: string; to: string }
  | { type: 'quick_reply'; label: string; message: string };

const ROUTES: Array<{ keywords: string[]; label: string; to: string }> = [
  { keywords: ['blood', 'donation', 'donate'], label: 'Open Blood Donation', to: '/blood-donation' },
  { keywords: ['ambulance', 'tracking', 'track'], label: 'Open Ambulance Tracking', to: '/ambulance' },
  { keywords: ['book', 'booking', 'request ambulance'], label: 'Open Book Ambulance', to: '/book-ambulance' },
  { keywords: ['dashboard', 'home'], label: 'Open Dashboard', to: '/dashboard' },
  { keywords: ['profile', 'account'], label: 'Open Profile', to: '/profile' },
  { keywords: ['campaign', 'campaigns'], label: 'Open Campaigns', to: '/campaigns' },
];

const isGreeting = (text: string) => {
  const t = text.trim().toLowerCase();
  return (
    t === 'hi' ||
    t === 'hello' ||
    t === 'hey' ||
    t.startsWith('hi ') ||
    t.startsWith('hello ') ||
    t.startsWith('hey ')
  );
};

const looksLikeAmbulanceStatusQuestion = (text: string) => {
  const t = text.toLowerCase();
  return (
    (t.includes('ambulance') && (t.includes('status') || t.includes('booking') || t.includes('request'))) ||
    t.includes('my ambulance') ||
    t.includes('track my ambulance')
  );
};

const detectNavigation = (text: string) => {
  const t = text.toLowerCase();
  const wantsToGo =
    t.includes('go to') ||
    t.includes('open') ||
    t.includes('take me') ||
    t.includes('navigate') ||
    t.includes('where is') ||
    t.includes('route') ||
    t.includes('link');

  if (!wantsToGo) return null;

  for (const r of ROUTES) {
    if (r.keywords.some((k) => t.includes(k))) return r;
  }
  return null;
};

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMessage = String(message).toLowerCase();

    // Always-available basics (no AI key required)
    if (isGreeting(message)) {
      const actions: ChatAction[] = [
        { type: 'quick_reply', label: 'My ambulance status', message: 'Show my ambulance booking status' },
        { type: 'quick_reply', label: 'Blood donation page', message: 'Open blood donation page' },
        { type: 'quick_reply', label: 'Book an ambulance', message: 'Open book ambulance page' },
      ];
      return res.json({
        reply:
          `Hi ${req.user?.name ? req.user.name : 'there'}! I can help you with:\n` +
          `- Your ambulance booking status\n` +
          `- Finding pages (Blood Donation, Book Ambulance, Dashboard, etc.)\n` +
          `Ask: "What is my ambulance booking status?" or "Open blood donation page".`,
        actions,
      });
    }

    // Emergency detection logic
    if (lowerMessage.includes('chest pain') || lowerMessage.includes('breathing problem')) {
      return res.json({
        reply: '⚠️ Please seek immediate medical help. Call emergency services or go to the nearest emergency room right away.',
      });
    }

    // Navigation help (return a clickable route)
    const nav = detectNavigation(message);
    if (nav) {
      const actions: ChatAction[] = [{ type: 'navigate', label: nav.label, to: nav.to }];
      return res.json({
        reply: `Here you go. Click to open: ${nav.to}`,
        actions,
      });
    }

    // User-specific ambulance booking status
    if (looksLikeAmbulanceStatusQuestion(message)) {
      if (!req.user?._id) {
        return res.status(401).json({ error: 'Not authorized' });
      }

      const latest = await AmbulanceRequest.findOne({ user: req.user._id })
        .populate('ambulance')
        .sort({ createdAt: -1 });

      if (!latest) {
        return res.json({
          reply:
            `I couldn't find any ambulance bookings for your account yet.\n` +
            `If you want, you can book one now.`,
          actions: [{ type: 'navigate', label: 'Open Book Ambulance', to: '/book-ambulance' }],
        });
      }

      const createdAt = latest.createdAt ? new Date(latest.createdAt).toLocaleString() : 'N/A';
      const status = latest.status || 'pending';
      const pickup = latest.pickupLocation?.address ? latest.pickupLocation.address : 'N/A';

      const ambulanceAny: any = (latest as any).ambulance;
      const ambulanceLabel =
        ambulanceAny && typeof ambulanceAny === 'object'
          ? ambulanceAny.registrationNumber
            ? `Ambulance ${ambulanceAny.registrationNumber}`
            : 'Assigned ambulance'
          : latest.ambulance
            ? 'Assigned ambulance'
            : 'Not assigned yet';

      return res.json({
        reply:
          `Your latest ambulance booking status:\n` +
          `- Status: ${status}\n` +
          `- Pickup: ${pickup}\n` +
          `- Ambulance: ${ambulanceLabel}\n` +
          `- Created: ${createdAt}`,
        actions: [{ type: 'navigate', label: 'Open Ambulance Tracking', to: '/ambulance' }],
      });
    }

    // Check if Gemini API key is available
    if (!GEMINI_API_KEY) {
      return res.json({
        reply:
          `I can help with basic navigation and your ambulance booking status.\n` +
          `Try: "Show my ambulance booking status" or "Open blood donation page".`,
        actions: [
          { type: 'quick_reply', label: 'My ambulance status', message: 'Show my ambulance booking status' },
          { type: 'navigate', label: 'Open Blood Donation', to: '/blood-donation' },
        ],
      });
    }

    // Prepare the prompt for Gemini
    const prompt = `You are a healthcare assistant.

User input: ${message}

Provide response in this format:

* Possible condition
* Severity (Low/Medium/High)
* Advice
* Doctor recommendation

If user asks about hospitals, suggest nearby hospitals (you can use dummy data).`;

    // Make request to Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the response from Gemini
    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Sorry, I could not process your request at the moment. Please try again.';

    res.json({
      reply: aiResponse,
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    if (error.response?.status === 400) {
      return res.status(400).json({ error: 'Invalid request to AI service.' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};
