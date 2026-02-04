import { memo } from 'react';
import type { ServerStatus } from '../types';

interface ServerStatusBadgeProps {
    status: ServerStatus;
    className?: string;
}

const ServerStatusBadge = memo(function ServerStatusBadge({
    status,
    className = ''
}: ServerStatusBadgeProps) {
    const { online, players } = status;

    return (
        <div
            className={`
        inline-flex items-center gap-2 px-3 py-1.5 
        rounded-sm glass text-sm font-medium
        ${className}
      `}
        >
            {/* Status dot */}
            <span
                className={`
          w-2 h-2 rounded-full
          ${online ? 'bg-status-online animate-pulse-slow' : 'bg-status-offline'}
        `}
            />

            {/* Status text */}
            <span className={online ? 'text-status-online' : 'text-status-offline'}>
                {online ? 'EN LIGNE' : 'HORS LIGNE'}
            </span>

            {/* Player count */}
            {online && players && (
                <span className="text-text-secondary ml-1">
                    {players.online}/{players.max}
                </span>
            )}
        </div>
    );
});

export default ServerStatusBadge;
