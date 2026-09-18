'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Bot,
  User,
  ArrowRight,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { ChatMessage, DigitalManifest } from '@/types';

interface GeminiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerRebalance: () => void;
  onOpenManifest: () => void;
}

const PRESET_QUERIES = [
  'Which PHCs will run out of Anti-Venom within 72 hours?',
  'Generate an optimal transfer manifest for PHC-Bilkisganj from CHC-Mandideep.',
  'Explain why CHC-Mandideep was selected as donor instead of DH Sehore.',
  'Perform a cold-chain risk audit for 2°C-8°C vaccine transit.',
];

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  isOpen,
  onClose,
  onTriggerRebalance,
  onOpenManifest,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hello! I am your **Gemini AI Drug Demand & Logistics Assistant**, connected in real time to the Sanjeevani-Mesh inventory ledger.\n\nI continuously monitor daily consumption burn rates, calculate FEFO (First-Expired, First-Out) donor allocations, and safeguard cold-chain biological integrity.\n\nHow can I assist your district logistics operations today?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.reply,
        reasoningSteps: data.reasoningSteps,
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (data.reasoningSteps && data.reasoningSteps.length > 0) {
        setExpandedReasoning((prev) => ({ ...prev, [assistantMsg.id]: true }));
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `⚠️ Failed to query Gemini engine: ${err.message}. Please verify local API connectivity.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-[#0c1222] shadow-2xl text-slate-100">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-2.5 text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Gemini Demand Assistant</h3>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                  GCP Vertex Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural Language Inventory Reasoning & Manifest Synthesizer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Query Chips */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 px-6 py-2.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <BrainCircuit className="h-3 w-3 text-purple-400" />
            Recommended Prompts:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-purple-500/40 hover:text-purple-300 hover:bg-purple-950/20 transition-all text-left truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                {msg.sender === 'user' ? (
                  <>
                    <span>You</span>
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-purple-400" />
                    <span className="font-semibold text-purple-300">Gemini Mesh Intelligence</span>
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Reasoning Accordion (if present) */}
              {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                <div className="mb-2 w-full max-w-lg rounded-lg border border-purple-900/40 bg-purple-950/20 text-xs">
                  <button
                    onClick={() => toggleReasoning(msg.id)}
                    className="flex w-full items-center justify-between px-3 py-1.5 font-medium text-purple-300 hover:bg-purple-900/30 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <BrainCircuit className="h-3.5 w-3.5 text-purple-400" />
                      View Vertex AI Chain-of-Thought ({msg.reasoningSteps.length} steps)
                    </span>
                    {expandedReasoning[msg.id] ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {expandedReasoning[msg.id] && (
                    <div className="border-t border-purple-900/40 p-2.5 space-y-1 text-[11px] text-slate-300">
                      {msg.reasoningSteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <span className="font-mono text-purple-400">{sIdx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[95%] shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none prose-invert'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.content}
                </div>

                {/* Suggested Action Trigger */}
                {msg.suggestedAction && (
                  <div className="mt-3 border-t border-slate-800 pt-2.5">
                    {msg.suggestedAction.type === 'TRIGGER_REBALANCE' && (
                      <button
                        onClick={() => {
                          onClose();
                          onTriggerRebalance();
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-500 transition-colors"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>{msg.suggestedAction.label}</span>
                      </button>
                    )}
                    {msg.suggestedAction.type === 'VIEW_MANIFEST' && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenManifest();
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-500 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>{msg.suggestedAction.label}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/30 border border-purple-900/40 p-3 rounded-xl max-w-xs">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>Analyzing district inventory telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800 bg-slate-900/90 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Gemini: e.g. Which PHCs will run out of Anti-Venom?"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>Vertex AI / Gemini 1.5 Flash grounded with BigQuery GIS</span>
            <span>Zero Data Exfiltration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
