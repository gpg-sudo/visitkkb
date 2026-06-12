import { NextResponse } from 'next/server';
import { getHistoryByCategory, getAllHistory } from '@/lib/data/history';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
        const items = getHistoryByCategory(category);
        return NextResponse.json(items);
    }

    const allItems = getAllHistory();
    return NextResponse.json(allItems);
}
