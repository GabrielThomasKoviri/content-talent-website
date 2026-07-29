import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Check, Plus, Edit, Trash2, Crown, Zap } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";

type Plan = {
  name: string; price: string; period: string; description: string;
  subscribers: number; revenue: string; features: string[];
  active: boolean; popular?: boolean;
};

const initialPlans: Plan[] = [
  {
    name: "Basic",
    price: "$9.99",
    period: "month",
    description: "Perfect for getting started",
    subscribers: 4309,
    revenue: "$43,049",
    features: ["Access to basic content library", "Standard video quality", "Community access", "Email support"],
    active: true,
  },
  {
    name: "Premium",
    price: "$29.99",
    period: "month",
    description: "Best for serious learners",
    subscribers: 8234,
    revenue: "$246,898",
    features: ["Access to all premium content", "4K video quality", "Priority community access", "Live Q&A sessions", "Downloadable resources", "24/7 priority support"],
    active: true,
    popular: true,
  },
  {
    name: "Annual Basic",
    price: "$99",
    period: "year",
    description: "Save 17% with annual billing",
    subscribers: 1245,
    revenue: "$123,255",
    features: ["All Basic plan features", "2 months free", "Annual exclusive content"],
    active: true,
  },
];

function PlanDialog({ open, onClose, plan }: {
  open: boolean; onClose: () => void; plan?: Plan;
}) {
  const isEdit = !!plan;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit "${plan!.name}" Plan` : "Create New Subscription Plan"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the plan details below" : "Set up a new pricing tier for your subscribers"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input id="plan-name" placeholder="e.g., Premium" defaultValue={plan?.name} />
            </div>
            <div>
              <Label htmlFor="plan-price">Price</Label>
              <Input id="plan-price" placeholder="e.g., 29.99" type="number" defaultValue={plan?.price.replace("$", "")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-period">Billing Period</Label>
              <Input id="plan-period" placeholder="month or year" defaultValue={plan?.period} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="plan-active" defaultChecked={plan?.active ?? true} />
              <Label htmlFor="plan-active">Active (visible to users)</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="plan-description">Description</Label>
            <Textarea id="plan-description" placeholder="Brief description of this plan" rows={2} defaultValue={plan?.description} />
          </div>
          <div>
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <Textarea
              id="plan-features"
              placeholder={"Access to premium content\n4K video quality\nPriority support"}
              rows={6}
              defaultValue={plan?.features.join("\n")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>{isEdit ? "Save Changes" : "Create Plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SubscriptionPlans() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  return (
    <div className="space-y-6">
      {/* Controlled dialogs at top level */}
      <PlanDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <PlanDialog open={!!editPlan} onClose={() => setEditPlan(null)} plan={editPlan ?? undefined} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage your subscription tiers</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />Create Plan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {initialPlans.map((plan, index) => (
          <Card key={index} className={plan.popular ? "border-purple-500 border-2" : ""}>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.popular && <Zap className="h-4 w-4 text-purple-600 fill-purple-600" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditPlan(plan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Subscribers</span>
                  <span className="font-semibold">{plan.subscribers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monthly Revenue</span>
                  <span className="font-semibold text-green-600">{plan.revenue}</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="font-medium text-sm">Features:</div>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Switch id={`plan-${index}`} defaultChecked={plan.active} />
                <Label htmlFor={`plan-${index}`} className="text-sm">
                  {plan.active ? "Active" : "Inactive"}
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  {initialPlans.map((plan, idx) => (
                    <th key={idx} className="text-center py-3 px-4 font-medium">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Content Library Access", values: ["✓", "✓", "✓"] },
                  { label: "Video Quality", values: ["Standard", "4K", "Standard"] },
                  { label: "Live Q&A Sessions", values: ["-", "✓", "-"] },
                  { label: "Downloadable Resources", values: ["-", "✓", "-"] },
                  { label: "Support", values: ["Email", "24/7 Priority", "Email"] },
                ].map((row, ri) => (
                  <tr key={ri} className={ri < 4 ? "border-b" : ""}>
                    <td className="py-3 px-4 text-gray-600">{row.label}</td>
                    {row.values.map((v, vi) => (
                      <td key={vi} className="text-center py-3 px-4 text-sm">
                        {v === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
