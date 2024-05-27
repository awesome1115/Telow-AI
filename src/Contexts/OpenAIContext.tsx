import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import OpenAI from 'openai';

interface OpenAIContextValue {
  openai: OpenAI;
}

const OpenAIContext = createContext<OpenAIContextValue | null>(null);

export const useOpenAI = (): OpenAI => {
  const context = useContext(OpenAIContext);
  if (!context) {
    throw new Error('useOpenAI must be used within an OpenAIProvider');
  }
  return context.openai || new OpenAI();
};

interface OpenAIProviderProps {
  children: ReactNode;
}

export const OpenAIProvider: React.FC<OpenAIProviderProps> = ({ children }) => {
  const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;

  const openai: OpenAI = useMemo(
    () =>
      new OpenAI({
        apiKey: openAIKey,
        dangerouslyAllowBrowser: true,
      }),
    [openAIKey]
  );

  const value = useMemo(() => ({ openai }), [openai]);

  return (
    <OpenAIContext.Provider value={value}>{children}</OpenAIContext.Provider>
  );
};
