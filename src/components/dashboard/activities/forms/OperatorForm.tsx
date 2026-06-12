"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Save, Upload, Plus } from "lucide-react";

interface OperatorFormProps {
    mode: "create" | "edit";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
}

export default function OperatorForm({ mode, initialData }: OperatorFormProps) {
    return (
        <form className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile & Company Data */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input placeholder="Enter company name" defaultValue={initialData?.company} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Registration Number</label>
                                    <Input placeholder="SSM / Business Reg No." defaultValue={initialData?.regNo} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Person</label>
                                    <Input placeholder="Full Name" defaultValue={initialData?.contactPerson} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" placeholder="company@example.com" defaultValue={initialData?.email} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile Phone</label>
                                    <Input placeholder="+60..." defaultValue={initialData?.phone} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Office Phone</label>
                                    <Input placeholder="+60..." defaultValue={initialData?.officePhone} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Operating Address</label>
                                <Input placeholder="Full address" defaultValue={initialData?.address} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description / Overview</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Company overview..."
                                    defaultValue={initialData?.description}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Website</label>
                                    <Input placeholder="https://..." defaultValue={initialData?.website} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">WhatsApp Link</label>
                                    <Input placeholder="wa.me/..." defaultValue={initialData?.whatsapp} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Social Media</label>
                                    <Input placeholder="Instagram / Facebook / TikTok" defaultValue={initialData?.social} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tags</label>
                                    <Input placeholder="Hiking, Rafting, etc." defaultValue={initialData?.tags} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activities Offered */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activities Offered</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border border-dashed rounded-lg p-8 text-center">
                                <p className="text-muted-foreground mb-4">Select activities this operator provides.</p>
                                <Button variant="outline" type="button">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Activity
                                </Button>
                                {/* TODO: Multi-select activity list & pricing */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Agents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Agents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border border-dashed rounded-lg p-8 text-center">
                                <p className="text-muted-foreground mb-4">Manage agents under this operator.</p>
                                <Button variant="outline" type="button">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Assign Agent
                                </Button>
                                {/* TODO: List of agents & add/remove functionality */}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Documents, Compliance, Status */}
                <div className="space-y-6">
                    {/* Status Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status & Compliance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Permit Expiry</label>
                                <Input type="date" defaultValue={initialData?.permitExpiry} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="onLeave" className="rounded border-gray-300" defaultChecked={initialData?.onLeave} />
                                <label htmlFor="onLeave" className="text-sm">On Leave / Not Available</label>
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
                                <label className="text-sm font-medium">Company Registration</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload PDF
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Insurance Policy</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Operating Permit</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full" type="button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Permit
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financials */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bank Name</label>
                                <Input placeholder="Bank Name" defaultValue={initialData?.bankName} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Account Number</label>
                                <Input placeholder="Account No." defaultValue={initialData?.accountNumber} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Commission Rate (%)</label>
                                <Input type="number" placeholder="10" defaultValue={initialData?.commissionRate} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Operator" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
