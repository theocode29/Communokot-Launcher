import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { NEWS_URL } from '../constants';
import type { NewsItem } from '../types';
import { Newspaper } from 'lucide-react';

const UpdatesPage = memo(function UpdatesPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                // setError(null); // Unused
                const response = await axios.get(NEWS_URL);
                const data = Array.isArray(response.data) ? response.data : response.data.items || [];
                setNews(data);
            } catch (err) {
                console.error('Failed to fetch news:', err);
                // setError('Impossible de charger les actualités'); // Unused
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
        <div className="h-full overflow-y-auto px-4 md:px-8 py-24 pb-48 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-16 flex items-end gap-6 border-b border-black/10 pb-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="p-4 bg-brand-primary text-text-main rounded-2xl">
                        <Newspaper size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white">ACTUALITÉS</h1>
                        <p className="text-white/60 uppercase tracking-widest text-xs mt-2">
                            Dernières communications du QG
                        </p>
                    </div>
                </motion.div>

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-black/10 border-t-brand-primary rounded-full animate-spin" />
                    </div>
                )}

                {/* News list */}
                {!loading && (
                    <motion.div
                        className="space-y-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {news.map((item, index) => (
                            <NewsCard key={item.id || index} item={item} index={index} />
                        ))}
                    </motion.div>
                )}
            </div>
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
            className="group relative bg-surface border border-black/5 rounded-2xl overflow-hidden shadow-2xl hover:border-brand-primary/30 transition-colors"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            {/* Image Section - Full Width */}
            {item.image && !imageError && (
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
                    />
                    {/* Gradient Overlay for Text Readability if needed, mostly decoration here */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />

                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-3 py-1 rounded-full border border-black/5 shadow-sm">
                        <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">
                            {item.date}
                        </span>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="p-8 relative">
                {!item.image && (
                    <div className="mb-4 inline-block bg-black/5 px-3 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            {item.date}
                        </span>
                    </div>
                )}

                <h3 className="text-2xl font-bold mb-3 leading-tight text-text-main group-hover:text-brand-primary transition-colors">
                    {item.title}
                </h3>

                {item.subtitle && (
                    <p className="text-text-muted text-sm font-medium mb-6 border-l-2 border-brand-primary pl-4">
                        {item.subtitle}
                    </p>
                )}

                <div className="prose prose-sm max-w-none text-text-muted">
                    <p className="leading-relaxed whitespace-pre-line">
                        {item.content}
                    </p>
                </div>
            </div>
        </motion.article>
    );
});

export default UpdatesPage;
