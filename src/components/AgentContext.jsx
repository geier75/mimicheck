import { createContext, useState, useCallback } from 'react';

export const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
    const [agentCursorPosition, setAgentCursorPosition] = useState({ x: 0, y: 0 });
    const [agentState, setAgentState] = useState('idle'); // idle, thinking, active, reasoning

    const animateCursorTo = useCallback(async (targetElement) => {
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        setAgentCursorPosition({ x: centerX, y: centerY });
        
        // Simulate animation time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate click
        targetElement.click();
    }, []);

    return (
        <AgentContext.Provider value={{
            agentCursorPosition,
            setAgentCursorPosition,
            agentState,
            setAgentState,
            animateCursorTo
        }}>
            {children}
        </AgentContext.Provider>
    );
};