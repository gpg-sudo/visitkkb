"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Save, Upload, MessageSquare } from "lucide-react";

interface AgentFormProps {
    mode: "create" | "edit";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
}

export default function AgentForm({ mode, initialData }: AgentFormProps) {
    return (
        <form className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal Details & Booking Tools */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Profile</CardTitle>
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
                                    <Input placeholder="Agent Name" defaultValue={initialData?.name} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input type="date" defaultValue={initialData?.dob} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" placeholder="agent@example.com" defaultValue={initialData?.email} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input placeholder="+60..." defaultValue={initialData?.phone} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input placeholder="Full address" defaultValue={initialData?.address} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio / Description</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Agent bio..."
                                    defaultValue={initialData?.bio}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Company (Optional)</label>
                                <Input placeholder="Agency Name" defaultValue={initialData?.company} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Tools */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" type="button">
                                    <span className="font-medium">Custom Package Builder</span>
                                    <span className="text-xs text-muted-foreground">Create custom quotes</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" type="button">
                                    <span className="font-medium">Manage Invoices</span>
                                    <span className="text-xs text-muted-foreground">Upload & View</span>
                                </Button>
                            </div>
                            {/* TODO: Ability to edit customer names, trip dates, upload receipts */}
                        </CardContent>
                    </Card>

                    {/* WhatsApp Group Tools */}
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Integration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Group Link</label>
                                <div className="flex gap-2">
                                    <Input placeholder="https://chat.whatsapp.com/..." defaultValue={initialData?.whatsappLink} />
                                    <Button variant="outline" size="icon" type="button">
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Token (Optional)</label>
                                <Input type="password" placeholder="Token for automation" defaultValue={initialData?.apiToken} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Documents, Status, Work */}
                <div className="space-y-6">
                    {/* Status Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Account Status</span>
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="onLeave" className="rounded border-gray-300" defaultChecked={initialData?.onLeave} />
                                <label htmlFor="onLeave" className="text-sm">On Leave / Not Available</label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Commission Rate (%)</label>
                                <Input type="number" placeholder="10" defaultValue={initialData?.commissionRate} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Documents Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ID / Passport</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload ID
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Certification</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Cert
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Work */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Assigned Work</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Activities Handled</label>
                                <Input placeholder="Select activities..." defaultValue={initialData?.activities} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assigned Trips</label>
                                <Button variant="secondary" className="w-full" type="button">View Assigned Trips</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Agent" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
