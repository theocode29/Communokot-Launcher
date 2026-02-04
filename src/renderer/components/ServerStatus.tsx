import { memo } from 'react';
import type { ServerStatus } from '../types';
import { Users } from 'lucide-react';

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
        <div className={`
            flex items-center gap-4 px-4 py-2 rounded-full
            bg-surface/50 backdrop-blur-md border border-black/5 shadow-lg
            ${className}
        `}>
            {/* Online/Offline Text & Icon */}
            <div className="flex items-center gap-2">
                {online ? (
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                ) : (
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}

                <span className={`text-xs font-bold tracking-widest uppercase ${online ? 'text-green-600' : 'text-red-600'}`}>
                    {online ? 'SERVEUR EN LIGNE' : 'SERVEUR HORS LIGNE'}
                </span>
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-black/10" />

            {/* Player Count */}
            <div className="flex items-center gap-2">
                <Users size={14} className={online ? 'text-text-muted' : 'text-text-muted/50'} />
                <span className={`text-xs font-mono font-bold ${online ? 'text-text-main' : 'text-text-muted'}`}>
                    {online && players ? (
                        <>{players.online} <span className="text-text-muted">/</span> {players.max}</>
                    ) : (
                        '- / -'
                    )}
                </span>
            </div>
        </div>
    );
});

export default ServerStatusBadge;
