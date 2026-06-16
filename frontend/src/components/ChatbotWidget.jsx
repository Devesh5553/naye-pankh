import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from '../config';

export const ChatbotWidget = () => {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Set initial greeting
    setMessages([
      { sender: 'bot', text: t('bot-welcome') }
    ]);
  }, [lang]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
      const isHindi = hasDevanagari || lang === 'hi';
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.includes(isHindi ? 'hi' : 'en'));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (text = inputText) => {
    const cleanText = text.trim();
    if (!cleanText) return null;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: cleanText }]);
    setInputText('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanText, lang })
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        return data.reply;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  // Web Speech API STT
  const recognitionRef = useRef(null);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi'
        ? 'क्षमा करें, आपके ब्राउज़र पर वॉइस चैट फीचर समर्थित नहीं है। कृपया गूगल क्रोम का उपयोग करें।'
        : 'Sorry, Voice Chat is not supported on this browser. Please use Google Chrome.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        const reply = await handleSendMessage(transcript);
        if (reply) {
          speakText(reply);
        }
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  return (
    <div className="chatbot-widget" id="chatbotWidget">
      <div className="chatbot-bubble" onClick={() => setIsOpen(!isOpen)} aria-label="Open AI Assistant">
        <i className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-comments"}></i>
      </div>

      <div className={`chatbot-window ${isOpen ? 'active' : ''}`}>
        <div className="chat-header">
          <h3><i className="fa-solid fa-robot"></i> <span>{t('bot-title')}</span></h3>
          <button className="chat-close" onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.sender}`}>
              {m.text.split('\n').map((line, idx) => (
                <span key={idx}>{line}<br /></span>
              ))}
              {m.sender === 'bot' && (
                <button className="msg-speak-btn" onClick={() => speakText(m.text)} aria-label="Read aloud">
                  <i className="fa-solid fa-volume-high"></i>
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-suggested-chips">
          <span className="suggest-chip" onClick={() => handleSendMessage('80G Exemption')}>{t('chip-80g')}</span>
          <span className="suggest-chip" onClick={() => handleSendMessage('How to volunteer?')}>{t('chip-vol')}</span>
          <span className="suggest-chip" onClick={() => handleSendMessage('NGO Certificates')}>{t('chip-cert')}</span>
          <span className="suggest-chip" onClick={() => handleSendMessage('दान कैसे करें?')}>{t('chip-donate-hi')}</span>
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder={lang === 'hi' ? 'सवाल पूछें...' : 'Type a message / सवाल पूछें...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button className={`chat-voice-btn ${isRecording ? 'recording' : ''}`} onClick={toggleVoiceInput} aria-label="Voice Input">
            <i className={isRecording ? "fa-solid fa-microphone-slash" : "fa-solid fa-microphone"}></i>
          </button>
          <button className="chat-send" onClick={() => handleSendMessage()} aria-label="Send Message">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
