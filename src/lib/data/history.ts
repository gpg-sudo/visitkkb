export interface HistoryItem {
    id?: number;
    title: string;
    slug: string;
    year?: string;
    category: 'history-timeline' | 'history-locations' | 'history-figures' | 'history-trivia' | 'history-meta';
    content: string;
    status: 'draft' | 'published';
    order?: number;
    highlighted?: boolean;
    icon?: string;
}

// This would normally come from a database
import historyData from './history-seed.json';

export const historyItems: HistoryItem[] = historyData as HistoryItem[];

export function getHistoryByCategory(category: string): HistoryItem[] {
    return historyItems
        .filter(item => item.category === category && item.status === 'published')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAllHistory(): HistoryItem[] {
    return historyItems.filter(item => item.status === 'published');
}
