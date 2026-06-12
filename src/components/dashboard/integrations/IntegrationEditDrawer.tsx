"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/Sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Loader2, Save, ExternalLink, BookOpen } from "lucide-react";

interface IntegrationConfig {
  id: string;
  category: string;
  provider: string;
  displayName: string;
  type: string;
  isActive: boolean;
  apiKeySource: string;
  apiKey?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  affiliateId: string | null;
  accessToken?: string | null;
  baseUrl: string | null;
  deepLinkPattern: string | null;
  webhookUrl?: string | null;
  configJson: string | null;
  description: string | null;
  websiteUrl: string | null;
  documentationUrl: string | null;
  priority: number;
}

interface IntegrationEditDrawerProps {
  integration: IntegrationConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function IntegrationEditDrawer({
  integration,
  open,
  onOpenChange,
  onSave,
}: IntegrationEditDrawerProps) {
  const [formData, setFormData] = useState<IntegrationConfig>(integration);
  const [configText, setConfigText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(integration);
    setConfigText(
      integration.configJson
        ? JSON.stringify(JSON.parse(integration.configJson), null, 2)
        : ""
    );
  }, [integration]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate JSON config if provided
      let parsedConfig = null;
      if (configText.trim()) {
        try {
          parsedConfig = JSON.parse(configText);
        } catch {
          setError("Invalid JSON in configuration");
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`/api/integrations/config/${integration.provider}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({
          ...formData,
          configJson: parsedConfig ? JSON.stringify(parsedConfig) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSave();
      } else {
        setError(data.error || "Failed to save");
      }
    } catch (err) {
      setError("Failed to save integration");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isAffiliateCategory = integration.category === "AFFILIATE";
  const isDataSourceCategory = ["ACCOMMODATION", "ACTIVITIES", "DINING"].includes(
    integration.category
  );
  const isSocialCategory = integration.category === "SOCIAL_MEDIA";
  const isMapsCategory = integration.category === "MAPS_TRANSPORT";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure {integration.displayName}</SheetTitle>
          <SheetDescription>
            {integration.description}
            <div className="flex gap-2 mt-2">
              {integration.websiteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={integration.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Website
                  </a>
                </Button>
              )}
              {integration.documentationUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={integration.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Docs
                  </a>
                </Button>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable this integration
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          {/* API Key Source */}
          <div className="space-y-2">
            <Label>API Key Source</Label>
            <Select
              value={formData.apiKeySource}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, apiKeySource: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENV">Environment Variable</SelectItem>
                <SelectItem value="DB">Database</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.apiKeySource === "ENV"
                ? `Set ${integration.provider}_API_KEY in your environment`
                : "Store API key in database (less secure)"}
            </p>
          </div>

          {/* API Key (only if DB source) */}
          {formData.apiKeySource === "DB" && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder="Enter API key"
              />
            </div>
          )}

          {/* Affiliate-specific fields */}
          {isAffiliateCategory && (
            <>
              <div className="space-y-2">
                <Label>Affiliate / Partner ID</Label>
                <Input
                  value={formData.affiliateId || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, affiliateId: e.target.value }))
                  }
                  placeholder="Your affiliate ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value={formData.baseUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                  }
                  placeholder="https://partner.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Deep Link Pattern</Label>
                <Textarea
                  value={formData.deepLinkPattern || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deepLinkPattern: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/search?q={propertyName}&aid={affiliateId}"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders: {"{propertyName}"}, {"{location}"}, {"{affiliateId}"},{" "}
                  {"{checkIn}"}, {"{checkOut}"}
                </p>
              </div>
            </>
          )}

          {/* Data source fields */}
          {isDataSourceCategory && (
            <>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value={formData.baseUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                  }
                  placeholder="https://api.example.com"
                />
              </div>
            </>
          )}

          {/* Social media fields */}
          {isSocialCategory && (
            <>
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input
                  value={formData.clientId || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                  }
                  placeholder="OAuth client ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input
                  type="password"
                  value={formData.accessToken || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accessToken: e.target.value,
                    }))
                  }
                  placeholder="Access token"
                />
              </div>
            </>
          )}

          {/* Maps fields */}
          {isMapsCategory && (
            <>
              <div className="space-y-2">
                <Label>Webhook URL (optional)</Label>
                <Input
                  value={formData.webhookUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      webhookUrl: e.target.value,
                    }))
                  }
                  placeholder="https://yoursite.com/api/webhook"
                />
              </div>
            </>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Higher priority integrations are preferred for matching
            </p>
          </div>

          {/* Custom Config JSON */}
          <div className="space-y-2">
            <Label>Advanced Configuration (JSON)</Label>
            <Textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder='{"key": "value"}'
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Custom settings in JSON format (e.g., search radius, filters, defaults)
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

