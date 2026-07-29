import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Upload, Smartphone, Monitor, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const colorPresets = [
  { name: "Purple", primary: "#8b5cf6", secondary: "#3b82f6" },
  { name: "Blue", primary: "#3b82f6", secondary: "#06b6d4" },
  { name: "Green", primary: "#10b981", secondary: "#059669" },
  { name: "Orange", primary: "#f97316", secondary: "#ea580c" },
  { name: "Red", primary: "#ef4444", secondary: "#dc2626" },
  { name: "Pink", primary: "#ec4899", secondary: "#db2777" },
];

export default function Branding() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branding & Customization</h1>
          <p className="text-gray-600 mt-1">Customize your app's look and feel to match your brand</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="app-name">App Name</Label>
                <Input id="app-name" defaultValue="Creator Academy" />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" defaultValue="Learn from the best creators" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  defaultValue="Your go-to platform for premium educational content from industry experts. Access exclusive tutorials, courses, and live sessions."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>App Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    CA
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 512x512px PNG or SVG
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>App Icon</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg" />
                  <div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Icon
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1024x1024px PNG
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Splash Screen</Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your splash screen, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 1080x1920px PNG
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Color Presets</Label>
                <div className="grid grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      className="border-2 border-gray-200 rounded-lg p-3 hover:border-purple-500 transition-colors"
                    >
                      <div className="flex gap-2 mb-2">
                        <div
                          className="h-8 w-8 rounded"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="h-8 w-8 rounded"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <div className="text-sm font-medium">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      id="primary-color"
                      defaultValue="#8b5cf6"
                      className="w-16 h-10"
                    />
                    <Input defaultValue="#8b5cf6" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      id="secondary-color"
                      defaultValue="#3b82f6"
                      className="w-16 h-10"
                    />
                    <Input defaultValue="#3b82f6" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Input id="font-family" defaultValue="Inter, system-ui, sans-serif" />
              </div>
              <div className="p-6 border border-gray-200 rounded-lg space-y-3">
                <div className="text-3xl font-bold">Heading Example</div>
                <div className="text-xl font-semibold">Subheading Example</div>
                <div className="text-base">
                  This is body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="mobile">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mobile" className="gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger value="desktop" className="gap-2">
                      <Monitor className="h-4 w-4" />
                      Desktop
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="mobile" className="mt-4">
                    <div className="border-4 border-gray-800 rounded-3xl p-3 bg-gray-800">
                      <div className="bg-white rounded-2xl overflow-hidden">
                        {/* Mobile Preview */}
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white">
                          <div className="h-12 w-12 bg-white rounded-xl mb-3" />
                          <h2 className="text-xl font-bold">Creator Academy</h2>
                          <p className="text-sm opacity-90">Learn from the best</p>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-full" />
                          <div className="h-3 bg-gray-100 rounded w-5/6" />
                        </div>
                        <div className="flex border-t">
                          <div className="flex-1 py-3 text-center">
                            <div className="h-6 w-6 mx-auto bg-purple-200 rounded-lg" />
                          </div>
                          <div className="flex-1 py-3 text-center">
                            <div className="h-6 w-6 mx-auto bg-gray-200 rounded-lg" />
                          </div>
                          <div className="flex-1 py-3 text-center">
                            <div className="h-6 w-6 mx-auto bg-gray-200 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="desktop" className="mt-4">
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Desktop Preview */}
                      <div className="bg-gray-100 px-3 py-2 border-b flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        </div>
                      </div>
                      <div className="bg-white">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex items-center gap-3">
                          <div className="h-10 w-10 bg-white rounded-lg" />
                          <div>
                            <div className="font-bold">Creator Academy</div>
                            <div className="text-xs opacity-90">Learn from the best</div>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                          <div className="h-2 bg-gray-100 rounded w-full" />
                          <div className="h-2 bg-gray-100 rounded w-4/5" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
