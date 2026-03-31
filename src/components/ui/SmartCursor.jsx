import { useContext } from 'react';
import { AgentContext } from '../AgentContext';
import { cn } from "@/lib/utils";
import { MousePointer, Brain } from 'lucide-react';

export default function SmartCursor() {
    const { agentCursorPosition, agentState } = useContext(AgentContext);

    // Don't render if position is not set yet
    if (agentCursorPosition.x === 0 && agentCursorPosition.y === 0) {
        return null;
    }

    const isAgentActive = agentState !== 'idle';

    return (
        <div
            className="fixed pointer-events-none transition-transform duration-75 ease-out z-[10000]"
            style={{
                left: `${agentCursorPosition.x}px`,
                top: `${agentCursorPosition.y}px`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div className={cn("transition-all duration-300", isAgentActive ? 'w-10 h-10' : 'w-8 h-8')}>
                {/* Outer Ping */}
                <div className={cn(
                    "absolute w-full h-full rounded-full animate-ping-slow",
                    isAgentActive ? "bg-purple-500 opacity-30" : "bg-blue-500 opacity-20"
                )} />
                
                {/* Main Cursor Element */}
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300",
                    isAgentActive 
                        ? 'w-10 h-10 bg-purple-600 shadow-lg' 
                        : 'w-2 h-2 bg-blue-600'
                )}>
                    {isAgentActive && <Brain className="w-5 h-5 text-white animate-pulse" />}
                </div>
            </div>
        </div>
    );
}