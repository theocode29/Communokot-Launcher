import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { NEWS_URL } from '../constants';
import type { NewsItem } from '../types';

const UpdatesPage = memo(function UpdatesPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(NEWS_URL);

                // Handle both array and object with items
                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.items || [];

                setNews(data);
            } catch (err) {
                console.error('Failed to fetch news:', err);
                setError('Impossible de charger les actualités');

                // Use mock data as fallback
                setNews([
                    {
                        id: '1',
                        title: 'OUVERTURE COMMUNOKOT !',
                        subtitle: 'Launcher, carte du monde 2D/3D,...',
                        content: 'Je peux ajouter tout ce que l\'on veut sur le serveur zero limite, du coup si vous avez des idées, bah dites-les...',
                        image: 'https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/main/images/welcome.jpg',
                        date: '03/02/2026',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="h-full overflow-y-auto p-8">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                    MISES À JOUR
                    <span className="w-3 h-3 rounded-full bg-tab-updates animate-pulse" />
                </h1>
                <p className="text-text-secondary mt-2">
                    Derniers patchs, nouvelles et communications.
                </p>
            </motion.div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-tab-updates rounded-full animate-spin" />
                </div>
            )}

            {/* Error state (but we show mock data anyway) */}
            {error && !news.length && (
                <div className="text-center py-20">
                    <p className="text-status-offline">{error}</p>
                </div>
            )}

            {/* News list */}
            {!loading && news.length > 0 && (
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {news.map((item, index) => (
                        <NewsCard key={item.id || index} item={item} index={index} />
                    ))}
                </motion.div>
            )}

            {/* Empty state */}
            {!loading && news.length === 0 && !error && (
                <div className="text-center py-20">
                    <p className="text-text-secondary">Aucune actualité pour le moment.</p>
                </div>
            )}
        </div>
    );
});

// News card component
interface NewsCardProps {
    item: NewsItem;
    index: number;
}

const NewsCard = memo(function NewsCard({ item, index }: NewsCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.article
            className="glass rounded-sm overflow-hidden card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            {/* Image */}
            {item.image && !imageError && (
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {/* Title and date */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <span className="text-xs text-text-muted whitespace-nowrap font-mono">
                        {item.date}
                    </span>
                </div>

                {/* Subtitle */}
                {item.subtitle && (
                    <p className="text-tab-updates text-sm mb-3">{item.subtitle}</p>
                )}

                {/* Content */}
                <p className="text-text-secondary text-sm leading-relaxed">
                    {item.content}
                </p>
            </div>
        </motion.article>
    );
});

export default UpdatesPage;
