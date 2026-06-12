"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Save, Calendar as CalendarIcon, MapPin, Users, Clock, DollarSign, MessageCircle } from "lucide-react";

interface TripFormProps {
    mode: "create" | "edit";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
}

export default function TripForm({ mode, initialData }: TripFormProps) {
    return (
        <form className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Activity & Operator */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity & Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Activity</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.activityId}>
                                    <option value="">-- Choose Activity --</option>
                                    <option value="1">White Water Rafting</option>
                                    <option value="2">Chiling Waterfall Hike</option>
                                    <option value="3">Paragliding Experience</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Operator</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.operatorId}>
                                        <option value="">-- Select Operator --</option>
                                        <option value="1">KKB Outdoor</option>
                                        <option value="2">Nature Guides</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Agent (Optional)</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.agentId}>
                                        <option value="">-- None --</option>
                                        <option value="1">Agent A</option>
                                        <option value="2">Agent B</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assigned Guides</label>
                                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="guide1" className="rounded border-gray-300" defaultChecked={initialData?.guideIds?.includes("1")} />
                                        <label htmlFor="guide1" className="text-sm">Ali (Malim Gunung)</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="guide2" className="rounded border-gray-300" defaultChecked={initialData?.guideIds?.includes("2")} />
                                        <label htmlFor="guide2" className="text-sm">Ahmad</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="guide3" className="rounded border-gray-300" defaultChecked={initialData?.guideIds?.includes("3")} />
                                        <label htmlFor="guide3" className="text-sm">Sarah</label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule & Capacity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule & Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input type="date" className="pl-10" defaultValue={initialData?.date} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input type="time" className="pl-10" defaultValue={initialData?.startTime} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Time (Optional)</label>
                                    <Input type="time" defaultValue={initialData?.endTime} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duration Override (Optional)</label>
                                <Input placeholder="e.g. 5 Hours (Leave empty to use Activity default)" defaultValue={initialData?.durationOverride} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Max Participants</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input type="number" className="pl-10" placeholder="15" defaultValue={initialData?.maxParticipants} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Participants</label>
                                    <Input type="number" readOnly defaultValue={initialData?.currentParticipants || 0} className="bg-muted" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logistics & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Logistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">WhatsApp Group Link</label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input className="pl-10" placeholder="https://chat.whatsapp.com/..." defaultValue={initialData?.whatsappGroupLink} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meeting Point Name</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input className="pl-10" placeholder="e.g. KKB Post Office" defaultValue={initialData?.meetingPointName} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes for Participants</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Important info for the trip..."
                                    defaultValue={initialData?.notesForParticipants}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes for Guide (Internal)</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Internal notes..."
                                    defaultValue={initialData?.notesForGuide}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Status & Pricing */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status & Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Trip Status</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.status || "UPCOMING"}>
                                    <option value="UPCOMING">Upcoming</option>
                                    <option value="FULLY_BOOKED">Fully Booked</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price Override (Optional)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input type="number" className="pl-10" placeholder="Leave empty to use Activity price" defaultValue={initialData?.priceOverride} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pricing Unit</label>
                                <Input placeholder="per person" defaultValue={initialData?.pricingUnit || "per person"} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Trip Title</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input placeholder="Auto-generated (e.g. Rafting - 12 Feb)" defaultValue={initialData?.title} />
                                <p className="text-xs text-muted-foreground">Usually auto-generated from Activity + Date</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex justify-end gap-4 z-10 lg:pl-64">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Trip" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
