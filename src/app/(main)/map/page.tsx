import prisma from '@/lib/prisma';
import Map from '@/components/maps/Map';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Interactive Map | VisitKKB',
    description: 'Explore Kuala Kubu Bharu with our interactive map. Find attractions, food, and stays.',
};

export default async function MapPage() {
    // Fetch all public pins
    const pins = await prisma.mapPin.findMany({
        where: {
            public: true,
            isVisible: true,
        },
        select: {
            id: true,
            title: true,
            lat: true,
            lng: true,
            description: true,
            category: true,
        },
    }) as Array<{
        id: string;
        title: string;
        lat: number;
        lng: number;
        description: string | null;
        category: string | null;
    }>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">Explore KKB</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Discover the best spots in Kuala Kubu Bharu. From historical landmarks to hidden waterfalls and local eateries.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 h-[600px] border rounded-xl overflow-hidden shadow-sm">
                    <Map pins={pins} />
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Legend</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-sm">Attractions</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-sm">Nature</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                <span className="text-sm">Food & Dining</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                <span className="text-sm">Stays</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                        <h3 className="font-semibold text-lg mb-2 text-primary">Need Directions?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Click on any pin to see more details. You can also use our route planner to find the best way to get there.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
