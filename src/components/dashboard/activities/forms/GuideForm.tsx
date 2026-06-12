"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Save, Upload, Calendar as CalendarIcon } from "lucide-react";

interface GuideFormProps {
    mode: "create" | "edit";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
}

export default function GuideForm({ mode, initialData }: GuideFormProps) {
    return (
        <form className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal Details & Certifications */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Guide Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                                    <span className="text-muted-foreground text-xs">Photo</span>
                                </div>
                                <Button variant="outline" size="sm" type="button">Change Photo</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input placeholder="Guide Name" defaultValue={initialData?.name} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input type="date" defaultValue={initialData?.dob} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" placeholder="guide@example.com" defaultValue={initialData?.email} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input placeholder="+60..." defaultValue={initialData?.phone} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Languages Spoken</label>
                                <Input placeholder="English, Malay, Mandarin..." defaultValue={initialData?.languages} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Specialization</label>
                                <Input placeholder="Hiking, Rafting, Bird Watching..." defaultValue={initialData?.specialization} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio / Description</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Guide bio..."
                                    defaultValue={initialData?.bio}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Certifications & Licenses</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Malim Gunung ID</label>
                                    <Input placeholder="ID Number" defaultValue={initialData?.malimId} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expiry Date</label>
                                    <Input type="date" defaultValue={initialData?.malimExpiry} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Aid Certificate</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Certificate
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Other Licenses</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Availability, WhatsApp, Status */}
                <div className="space-y-6">
                    {/* Availability Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border rounded-md p-4 flex flex-col items-center justify-center min-h-[200px] bg-muted/5">
                                <CalendarIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">Calendar Component Here</span>
                                {/* TODO: Calendar picker for available/off days */}
                            </div>
                            <Button variant="outline" className="w-full" type="button">Manage Schedule</Button>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Group Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Communication</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">WhatsApp Group Link</label>
                                <Input placeholder="https://chat.whatsapp.com/..." defaultValue={initialData?.whatsappLink} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Token</label>
                                <Input type="password" placeholder="Token" defaultValue={initialData?.apiToken} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Guide Status</span>
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="onLeave" className="rounded border-gray-300" defaultChecked={initialData?.onLeave} />
                                <label htmlFor="onLeave" className="text-sm">On Leave / Not Available</label>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
                                Warning: First Aid Cert expires in 30 days.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Guide" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
