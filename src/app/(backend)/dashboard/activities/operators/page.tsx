import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Mail, Phone, MessageCircle, Building2, CheckCircle, XCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function OperatorsListPage() {
    const operators = await prisma.operator.findMany({
        include: {
            activities: {
                select: {
                    id: true,
                    title: true
                }
            },
            stays: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Operators</h1>
                    <p className="text-muted-foreground">
                        View and manage all registered operators ({operators.length} total)
                    </p>
                </div>
                <Link href="/dashboard/activities/operators/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Operator
                    </Button>
                </Link>
            </div>

            {/* Operators Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {operators.map((operator) => (
                    <div
                        key={operator.id}
                        className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card"
                    >
                        {/* Header with Logo */}
                        <div className="flex items-start gap-4 mb-4">
                            {operator.logo ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border">
                                    <Image
                                        src={operator.logo}
                                        alt={operator.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{operator.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${operator.type === 'OPERATOR'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                        }`}>
                                        {operator.type}
                                    </span>
                                    {operator.verified ? (
                                        <span title="Verified">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        </span>
                                    ) : (
                                        <span title="Not Verified">
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {operator.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {operator.description}
                            </p>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{operator.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span>{operator.phone}</span>
                            </div>
                            {operator.whatsapp && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{operator.whatsapp}</span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm border-t pt-4">
                            <div>
                                <span className="text-muted-foreground">Activities: </span>
                                <span className="font-semibold">{operator.activities.length}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Stays: </span>
                                <span className="font-semibold">{operator.stays.length}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Commission: </span>
                                <span className="font-semibold">{operator.commission}%</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                            <Link href={`/dashboard/activities/operators/${operator.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    View Details
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {operators.length === 0 && (
                <div className="border rounded-lg p-12 text-center">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No operators yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by adding your first operator
                    </p>
                    <Link href="/dashboard/activities/operators/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Operator
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
