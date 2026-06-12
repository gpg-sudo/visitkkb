"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Save, Upload, MapPin, Plus } from "lucide-react";

interface ActivityFormProps {
    mode: "create" | "edit";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
}

export default function ActivityForm({ mode, initialData }: ActivityFormProps) {
    return (
        <form className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Activity Title</label>
                                <Input placeholder="e.g. White Water Rafting" defaultValue={initialData?.title} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug</label>
                                    <Input placeholder="white-water-rafting" defaultValue={initialData?.slug} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Short Tagline</label>
                                    <Input placeholder="e.g. Adrenaline Rush" defaultValue={initialData?.shortTagline} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location Name</label>
                                <Input placeholder="e.g. Sungai Selangor, KKB" defaultValue={initialData?.locationName} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Short Description (Card Summary)</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Brief summary for the listing card..."
                                    defaultValue={initialData?.shortDescription}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Description</label>
                                <div className="border rounded-md p-4 min-h-[200px] bg-muted/5 text-muted-foreground text-center flex items-center justify-center">
                                    Rich Text Editor Placeholder
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Media</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Thumbnail Image</label>
                                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">Click to upload thumbnail</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Gallery Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    {/* Placeholder for uploaded images */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Map */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Map</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Show on Explore Map</label>
                                <input type="checkbox" className="rounded border-gray-300" defaultChecked={initialData?.showOnMap} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Latitude</label>
                                    <Input placeholder="3.56..." defaultValue={initialData?.mapLocation?.lat} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Longitude</label>
                                    <Input placeholder="101.65..." defaultValue={initialData?.mapLocation?.lng} />
                                </div>
                            </div>
                            <div className="border rounded-md p-4 h-[200px] bg-muted/10 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-muted-foreground mr-2" />
                                <span className="text-sm text-muted-foreground">Map Selector Placeholder</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Settings & Relations */}
                <div className="space-y-6">
                    {/* Status & Booking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status & Booking</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.status || "DRAFT"}>
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isFeatured" className="rounded border-gray-300" defaultChecked={initialData?.isFeatured} />
                                <label htmlFor="isFeatured" className="text-sm">Feature this activity</label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Booking Type</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.bookingType || "EXTERNAL_LINK"}>
                                    <option value="EXTERNAL_LINK">External Link</option>
                                    <option value="INTERNAL_BOOKING">Internal Booking System</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Booking URL</label>
                                <Input placeholder="https://..." defaultValue={initialData?.bookingUrl} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price</label>
                                    <Input type="number" placeholder="0.00" defaultValue={initialData?.price} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Currency</label>
                                    <Input defaultValue="MYR" readOnly />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Unit</label>
                                <Input placeholder="per person" defaultValue={initialData?.pricingUnit} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Label</label>
                                <Input placeholder="RM 150 per person" defaultValue={initialData?.priceLabel} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Duration & Difficulty */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duration</label>
                                <Input placeholder="e.g. 4 Hours" defaultValue={initialData?.durationText} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Difficulty</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.difficulty || "EASY"}>
                                    <option value="EASY">Easy</option>
                                    <option value="MODERATE">Moderate</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rating</label>
                                <Input type="number" step="0.1" max="5" placeholder="4.8" defaultValue={initialData?.rating} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories & Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Main Category</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.mainCategory}>
                                    <option value="">Select Category</option>
                                    <option value="Water Sports">Water Sports</option>
                                    <option value="Hiking">Hiking</option>
                                    <option value="Cycling">Cycling</option>
                                    <option value="Culture">Culture</option>
                                    <option value="Relaxation">Relaxation</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags</label>
                                <Input placeholder="Adventure, Family, etc." defaultValue={initialData?.tags} />
                                <p className="text-xs text-muted-foreground">Comma separated</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Relations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Relations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Operator</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={initialData?.operatorId}>
                                    <option value="">Select Operator</option>
                                    <option value="1">Example Operator 1</option>
                                    <option value="2">Example Operator 2</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Available Guides</label>
                                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="guide1" className="rounded border-gray-300" />
                                        <label htmlFor="guide1" className="text-sm">Ali bin Abu</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="guide2" className="rounded border-gray-300" />
                                        <label htmlFor="guide2" className="text-sm">Jane Smith</label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Preferred Agents</label>
                                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="agent1" className="rounded border-gray-300" />
                                        <label htmlFor="agent1" className="text-sm">Agent A</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="agent2" className="rounded border-gray-300" />
                                        <label htmlFor="agent2" className="text-sm">Agent B</label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex justify-end gap-4 z-10 lg:pl-64">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Activity" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
