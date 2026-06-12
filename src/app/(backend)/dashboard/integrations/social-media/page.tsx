"use client";

import IntegrationList from "@/components/dashboard/integrations/IntegrationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Instagram, Facebook, MessageCircle, Camera } from "lucide-react";

export default function SocialMediaPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Media</h1>
        <p className="text-muted-foreground">
          Configure social media integrations for displaying feeds, sharing content,
          and enabling WhatsApp business communication.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">@visitkkb</p>
            <p className="text-sm text-muted-foreground">Feed display</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-500" />
              Facebook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Page</p>
            <p className="text-sm text-muted-foreground">Events & posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Business</p>
            <p className="text-sm text-muted-foreground">Booking messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4 text-purple-500" />
              UGC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">#visitkkb</p>
            <p className="text-sm text-muted-foreground">User content</p>
          </CardContent>
        </Card>
      </div>

      {/* Instagram Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Instagram Integration
          </CardTitle>
          <CardDescription>
            Display your Instagram feed on the website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Basic Display API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Shows recent posts from your Instagram account on the homepage
                and social section. Requires Facebook Developer account.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge>Photos</Badge>
                <Badge>Videos</Badge>
                <Badge>Reels</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Configuration</h4>
              <div className="text-sm space-y-2 mt-2">
                <p>
                  <span className="text-muted-foreground">Username:</span> @visitkkb
                </p>
                <p>
                  <span className="text-muted-foreground">Post limit:</span> 6 posts
                </p>
                <p>
                  <span className="text-muted-foreground">Display:</span> Grid layout
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Business */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            WhatsApp Business
          </CardTitle>
          <CardDescription>
            Enable WhatsApp communication for bookings and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Features</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Click-to-chat on activity pages</li>
                <li>• Booking confirmation messages</li>
                <li>• Reminder notifications</li>
                <li>• Quick inquiry buttons</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Template Messages</h4>
              <div className="space-y-2 mt-2">
                <div className="p-2 rounded bg-muted text-sm">
                  <span className="font-medium">booking_confirmation</span>
                  <p className="text-xs text-muted-foreground">
                    Sent when booking is confirmed
                  </p>
                </div>
                <div className="p-2 rounded bg-muted text-sm">
                  <span className="font-medium">booking_reminder</span>
                  <p className="text-xs text-muted-foreground">
                    Sent 24 hours before activity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage on Frontend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Where Social Media Appears</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded border">
              <h4 className="font-medium text-sm">Homepage</h4>
              <p className="text-xs text-muted-foreground">Instagram feed section</p>
            </div>
            <div className="p-3 rounded border">
              <h4 className="font-medium text-sm">Footer</h4>
              <p className="text-xs text-muted-foreground">Social media icons</p>
            </div>
            <div className="p-3 rounded border">
              <h4 className="font-medium text-sm">Activity Pages</h4>
              <p className="text-xs text-muted-foreground">WhatsApp inquiry button</p>
            </div>
            <div className="p-3 rounded border">
              <h4 className="font-medium text-sm">Booking Flow</h4>
              <p className="text-xs text-muted-foreground">WhatsApp confirmation</p>
            </div>
            <div className="p-3 rounded border">
              <h4 className="font-medium text-sm">Share Buttons</h4>
              <p className="text-xs text-muted-foreground">All listing pages</p>
            </div>
            <div className="p-3 rounded border">
              <h4 className="font-medium text-sm">Contact Page</h4>
              <p className="text-xs text-muted-foreground">All social links</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration List */}
      <IntegrationList
        category="SOCIAL_MEDIA"
        title="Social Media Integrations"
        description="Configure social media APIs and access tokens. Test to verify feed access."
      />
    </div>
  );
}

