import { Metadata } from "next";
import { getHistoryByCategory } from "@/lib/data/history";

export const metadata: Metadata = {
    title: "History of Kuala Kubu Bharu | VisitKKB",
    description: "Discover the fascinating history of Kuala Kubu Bharu - from ancient tin mining to colonial transformation, the 1883 dam tragedy, and the birth of a garden town.",
};

export default async function HistoryPage() {
    // Fetch history data by category
    const timelineItems = getHistoryByCategory('history-timeline');
    const locationItems = getHistoryByCategory('history-locations');
    const figureItems = getHistoryByCategory('history-figures');
    const triviaItems = getHistoryByCategory('history-trivia');
    const metaItems = getHistoryByCategory('history-meta');

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-amber-900 to-amber-700">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80')] bg-cover bg-center" />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
                        History of Kuala Kubu Bharu
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                        A tale of innovation, tragedy, and resilience spanning centuries
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                {/* Introduction */}
                <section className="mb-16">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Kuala Kubu Bharu has one of Selangor&apos;s most fascinating yet lesser-known histories. From prehistoric settlements to colonial transformation, from devastating tragedy to remarkable renewal—every chapter of KKB&apos;s story reveals the character and spirit of this unique town.
                    </p>
                </section>

                {/* Timeline Section */}
                {timelineItems.length > 0 && (
                    <section id="timeline" className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-primary">
                            Timeline: Key Moments in History
                        </h2>

                        <div className="space-y-8">
                            {timelineItems.map((item) => (
                                <div
                                    key={item.slug}
                                    className={`border-l-4 pl-6 ${item.highlighted ? 'border-red-600 bg-red-50 -ml-1 pl-7 py-4' : 'border-amber-600'}`}
                                >
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className={`text-sm font-bold uppercase ${item.highlighted ? 'text-red-600' : 'text-amber-600'}`}>
                                            {item.year}
                                        </span>
                                        <h3 className="text-xl font-semibold">{item.title}</h3>
                                    </div>
                                    <div
                                        className="text-gray-700 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Locations Section */}
                {locationItems.length > 0 && (
                    <section id="locations" className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-primary">
                            Historical Locations & Landmarks
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {locationItems.map((item) => (
                                <div key={item.slug} className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                                    <div
                                        className="space-y-3 text-gray-700 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>') }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Key Figures */}
                {figureItems.length > 0 && (
                    <section id="figures" className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-primary">
                            Key Figures & Communities
                        </h2>

                        <div className="space-y-6">
                            {figureItems.map((item) => (
                                <div key={item.slug} className="border-b pb-4">
                                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                    <div
                                        className="text-gray-700 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trivia Section */}
                {triviaItems.length > 0 && (
                    <section id="trivia" className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-primary">
                            Did You Know?
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {triviaItems.map((item) => (
                                <div key={item.slug} className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-600">
                                    {item.icon && <div className="text-3xl mb-2">{item.icon}</div>}
                                    <h3 className="font-semibold mb-2">{item.title}</h3>
                                    <p className="text-gray-700 text-sm">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Preservation Section */}
                {metaItems.length > 0 && metaItems[0] && (
                    <section className="bg-primary/5 p-8 rounded-lg">
                        <h2 className="text-2xl font-serif font-bold mb-4 text-primary">
                            {metaItems[0].title}
                        </h2>
                        <div
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: metaItems[0].content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>') }}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
