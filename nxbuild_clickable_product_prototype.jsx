import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Building2, Home, MessageSquare, ClipboardList, FolderKanban, Wallet, CircleDollarSign, Settings, Sparkles, ArrowRight, Bot, Send, Plus, CheckCircle2, Clock3, Bell, ChevronRight, Image as ImageIcon, Receipt, CheckCheck, AlertCircle } from 'lucide-react';

type Service = { name: string; price: string };
type Message = { id: number; role: 'client' | 'user' | 'ai'; text: string; time: string; ai: boolean };
type EstimateItem = { id: number; name: string; unit: string; qty: number; price: number };
type Stage = { id: number; name: string; amount: number; paymentType: string; status: string; photos: number };

const initialServices: Service[] = [
  { name: 'Wall plastering', price: '$100/m²' },
  { name: 'Floor screed', price: '$80/m²' },
  { name: 'Electrical point installation', price: '$160/point' },
];

const initialConversation: Message[] = [
  { id: 1, role: 'client', text: 'Hi, I need renovation for a 50 m² apartment.', time: '10:02', ai: false },
  { id: 2, role: 'ai', text: 'Lead extracted: apartment renovation, around 50 m², medium budget. Suggested reply draft is ready.', time: '10:02', ai: true },
  { id: 3, role: 'user', text: 'Hello! Please share the property address and what kind of work you need.', time: '10:04', ai: false },
  { id: 4, role: 'client', text: 'Address is 125 Park Avenue. Need plastering, electrical work, and plumbing. Budget is around $100k.', time: '10:06', ai: false },
];

const estimateItemsSeed: EstimateItem[] = [
  { id: 1, name: 'Wall plastering', unit: 'm²', qty: 50, price: 100 },
  { id: 2, name: 'Floor screed', unit: 'm²', qty: 50, price: 80 },
  { id: 3, name: 'Electrical points', unit: 'point', qty: 20, price: 160 },
];

const stageSeed: Stage[] = [
  { id: 1, name: 'Demolition', amount: 3000, paymentType: 'On completion', status: 'Not started', photos: 0 },
  { id: 2, name: 'Rough works', amount: 6000, paymentType: 'Prepayment', status: 'Not started', photos: 0 },
  { id: 3, name: 'Finishing', amount: 3200, paymentType: 'On completion', status: 'Not started', photos: 0 },
];

function currency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function totalEstimate(items: EstimateItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function StatCard({ title, value, sub, icon: Icon }: { title: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </div>
          <div className="rounded-2xl border p-2">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Screen({ title, description, children, right }: { title: string; description: string; children: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {children}
      </div>
      <div className="space-y-4">{right}</div>
    </div>
  );
}

export default function NXBuildClickablePrototype() {
  const [page, setPage] = useState<'welcome' | 'onboarding' | 'inbox' | 'estimate' | 'project' | 'payments' | 'dashboard' | 'settings'>('welcome');
  const [orgName, setOrgName] = useState('Northfield Renovations');
  const [channel, setChannel] = useState<'Telegram' | 'WhatsApp'>('WhatsApp');
  const [services, setServices] = useState<Service[]>(initialServices);
  const [serviceInput, setServiceInput] = useState('Wall plastering $100/m², Floor screed $80/m², Electrical point installation $160/point');
  const [clientCreated, setClientCreated] = useState(false);
  const [draftGenerated, setDraftGenerated] = useState(true);
  const [draftText, setDraftText] = useState('Hello! Thanks for reaching out. Please share the property address, desired start date, and which works you need first.');
  const [conversation, setConversation] = useState<Message[]>(initialConversation);
  const [estimateItems] = useState<EstimateItem[]>(estimateItemsSeed);
  const [estimateReady, setEstimateReady] = useState(false);
  const [estimateSent, setEstimateSent] = useState(false);
  const [estimateApproved, setEstimateApproved] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);
  const [stages, setStages] = useState<Stage[]>(stageSeed);
  const [selectedStage, setSelectedStage] = useState(1);
  const [paymentRequested, setPaymentRequested] = useState(false);
  const [paymentPaid, setPaymentPaid] = useState(false);
  const [followupGenerated, setFollowupGenerated] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<'All' | 'Unread' | 'Leads'>('All');

  const estimateTotal = useMemo(() => totalEstimate(estimateItems), [estimateItems]);
  const currentStage = stages.find((s) => s.id === selectedStage) || stages[0];
  const activeProjects = projectCreated ? 1 : 0;
  const pendingPayments = paymentRequested && !paymentPaid ? currentStage.amount : 0;
  const earned = paymentPaid ? currentStage.amount : 0;

  const nav = [
    { key: 'welcome', label: 'Prototype flow', icon: Home },
    { key: 'onboarding', label: 'Onboarding', icon: Building2 },
    { key: 'inbox', label: 'Inbox', icon: MessageSquare },
    { key: 'estimate', label: 'Estimate', icon: ClipboardList },
    { key: 'project', label: 'Project', icon: FolderKanban },
    { key: 'payments', label: 'Payments', icon: Wallet },
    { key: 'dashboard', label: 'Dashboard', icon: CircleDollarSign },
    { key: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const addServicesFromAI = () => {
    setServices(initialServices);
  };

  const simulateClientLead = () => {
    setClientCreated(true);
    setDraftGenerated(true);
    setPage('inbox');
  };

  const sendDraft = () => {
    setConversation((prev) => [...prev, { id: prev.length + 1, role: 'user', text: draftText, time: '10:08', ai: false }]);
  };

  const generateEstimate = () => {
    setEstimateReady(true);
    setPage('estimate');
  };

  const sendEstimate = () => {
    setEstimateSent(true);
    setConversation((prev) => [...prev, { id: prev.length + 1, role: 'user', text: `Estimate sent: ${currency(estimateTotal)} with approval button.`, time: '10:14', ai: false }]);
  };

  const approveEstimate = () => {
    setEstimateApproved(true);
    setProjectCreated(true);
    setPage('project');
    setStages((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: 'In progress' } : s)));
  };

  const updateStage = (stageId: number, patch: Partial<Stage>) => {
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, ...patch } : s)));
  };

  const addPhotoToStage = () => {
    updateStage(selectedStage, { photos: currentStage.photos + 1, status: 'In progress' });
  };

  const sendForApproval = () => {
    updateStage(selectedStage, { status: 'Pending approval' });
  };

  const clientAcceptsStage = () => {
    updateStage(selectedStage, { status: 'Completed' });
    setPage('payments');
    setPaymentRequested(true);
  };

  const requestPayment = () => {
    setPaymentRequested(true);
  };

  const markPaymentPaid = () => {
    setPaymentPaid(true);
    setPage('dashboard');
  };

  const generateFollowup = () => {
    setFollowupGenerated(true);
    setTaskCreated(true);
  };

  const rightRail = (
    <>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Scenario progress</CardTitle>
          <CardDescription>Complete the full user journey from signup to payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={[
            orgName ? 12 : 0,
            services.length ? 24 : 0,
            clientCreated ? 40 : 0,
            estimateSent ? 58 : 0,
            estimateApproved ? 72 : 0,
            paymentRequested ? 86 : 0,
            paymentPaid ? 100 : 0,
          ].reduce((a, b) => Math.max(a, b), 0)} />
          <div className="space-y-2 text-sm">
            {[
              ['Foreman registered', !!orgName],
              ['Service templates added', services.length > 0],
              ['Lead arrived from messenger', clientCreated],
              ['Estimate sent', estimateSent],
              ['Project created', projectCreated],
              ['Payment requested', paymentRequested],
              ['Payment received', paymentPaid],
            ].map(([label, done]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-slate-600">{label}</span>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">AI assistant</CardTitle>
          <CardDescription>Construction-first assistant for drafts, estimates, reminders, and summaries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border p-3">
            <div>
              <p className="text-sm font-medium">Autopilot</p>
              <p className="text-xs text-slate-500">Auto-replies only inside safe rules</p>
            </div>
            <Button variant={autopilot ? 'default' : 'outline'} size="sm" onClick={() => setAutopilot((v) => !v)}>
              {autopilot ? 'On' : 'Off'}
            </Button>
          </div>
          <div className="rounded-2xl border p-3 text-sm text-slate-600">
            Suggested guardrails: working hours 9:00–21:00, stop-words enabled, low-confidence replies require approval.
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r bg-white p-4">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="rounded-2xl border p-2">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">NXBuild</p>
              <p className="text-xs text-slate-500">Messenger-first CRM</p>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            {nav.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition ${page === key ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Separator className="my-5" />

          <div className="rounded-2xl border p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Connected channels</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant={channel === 'Telegram' ? 'default' : 'outline'} onClick={() => setChannel('Telegram')}>Telegram</Button>
              <Button size="sm" variant={channel === 'WhatsApp' ? 'default' : 'outline'} onClick={() => setChannel('WhatsApp')}>WhatsApp</Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Prototype uses {channel} as the active lead source.</p>
          </div>
        </aside>

        <main className="p-4 lg:p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {page === 'welcome' && (
              <Screen
                title="NXBuild product prototype"
                description="An English clickable prototype for contractors, renovation teams, and messenger-led client workflows."
                right={rightRail}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Earned" value={currency(earned)} sub="Paid by clients" icon={CircleDollarSign} />
                  <StatCard title="Awaiting payment" value={currency(pendingPayments)} sub="Pending payment links" icon={Clock3} />
                  <StatCard title="Active projects" value={String(activeProjects)} sub="Live renovation jobs" icon={FolderKanban} />
                  <StatCard title="Tasks" value={taskCreated ? '1' : '0'} sub="Follow-up and control" icon={ClipboardList} />
                </div>

                <Card className="overflow-hidden rounded-3xl shadow-sm">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2">
                      <div className="space-y-5 p-8">
                        <Badge className="rounded-full">Construction OS · AI-first · Messenger-first</Badge>
                        <div>
                          <h2 className="text-4xl font-semibold tracking-tight">Close renovation deals and manage delivery in one elegant workflow.</h2>
                          <p className="mt-3 max-w-xl text-slate-500">
                            This premium prototype shows the full product journey: contractor onboarding, messenger lead capture, AI-assisted replies, instant estimating, project stage control, payment collection, and proactive follow-up.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button className="rounded-2xl" onClick={() => setPage('onboarding')}>Start onboarding <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          <Button className="rounded-2xl" variant="outline" onClick={simulateClientLead}>Skip to incoming lead</Button>
                        </div>
                      </div>
                      <div className="border-l bg-slate-100 p-8">
                        <div className="grid gap-3">
                          {[
                            'Act 1 — Contractor signs up and adds standard services',
                            'Act 2 — Lead enters from Telegram or WhatsApp',
                            'Act 3 — AI builds an estimate in 30 seconds',
                            'Act 4 — Project is split into payment-linked stages',
                            'Act 5 — Client pays via payment link',
                            'Act 6 — AI sends follow-up drafts and control tasks',
                          ].map((item, i) => (
                            <div key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold">{i + 1}</div>
                              <p className="text-sm text-slate-700">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Screen>
            )}

            {page === 'onboarding' && (
              <Screen
                title="Act 1 — Contractor onboarding"
                description="Register, add a team name, define standard services, and get a personal client bot plus web cabinet access."
                right={rightRail}
              >
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Create workspace</CardTitle>
                    <CardDescription>Email or Telegram login. Built for non-technical contractors.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium">Team name</p>
                        <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="rounded-2xl" />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium">Import standard services with AI</p>
                        <Textarea value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} className="min-h-[120px] rounded-2xl" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl" onClick={addServicesFromAI}><Sparkles className="mr-2 h-4 w-4" />Parse services</Button>
                        <Button className="rounded-2xl" variant="outline" onClick={() => setPage('inbox')}>Open web cabinet</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Card className="rounded-2xl border-dashed">
                        <CardHeader>
                          <CardTitle className="text-base">Detected services</CardTitle>
                          <CardDescription>Editable price templates for fast estimates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {services.map((service) => (
                            <div key={service.name} className="flex items-center justify-between rounded-2xl border p-3">
                              <div>
                                <p className="text-sm font-medium">{service.name}</p>
                                <p className="text-xs text-slate-500">Standard rate</p>
                              </div>
                              <Badge variant="secondary">{service.price}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      <Card className="rounded-2xl">
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Personal client bot</span>
                            <Badge>Ready</Badge>
                          </div>
                          <div className="rounded-2xl bg-slate-100 p-3 text-sm">t.me/{orgName.toLowerCase().replace(/\s+/g, '_')}_bot</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Web cabinet</span>
                            <Badge variant="secondary">Enabled</Badge>
                          </div>
                          <div className="rounded-2xl bg-slate-100 p-3 text-sm">app.nxbuild.ai/{orgName.toLowerCase().replace(/\s+/g, '-')}</div>
                          <Button className="w-full rounded-2xl" onClick={simulateClientLead}>Simulate first incoming lead</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </Screen>
            )}

            {page === 'inbox' && (
              <Screen
                title="Act 2 — Unified inbox"
                description="Incoming lead is captured from messenger, AI extracts intent, area, budget, and prepares a response draft for review."
                right={rightRail}
              >
                <Card className="overflow-hidden rounded-3xl shadow-sm">
                  <div className="grid min-h-[680px] lg:grid-cols-[280px_1fr_320px]">
                    <div className="border-r bg-white">
                      <div className="space-y-3 p-4">
                        <div className="flex gap-2">
                          {(['All', 'Unread', 'Leads'] as const).map((f) => (
                            <Button key={f} size="sm" variant={inboxFilter === f ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setInboxFilter(f)}>{f}</Button>
                          ))}
                        </div>
                        <div className="rounded-2xl border bg-slate-50 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar><AvatarFallback>JM</AvatarFallback></Avatar>
                              <div>
                                <p className="text-sm font-medium">James Miller</p>
                                <p className="text-xs text-slate-500">New lead · {channel}</p>
                              </div>
                            </div>
                            <Badge>1</Badge>
                          </div>
                          <p className="mt-3 text-xs text-slate-500">Needs renovation for a 50 m² apartment</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col bg-slate-50">
                      <div className="flex items-center justify-between border-b bg-white p-4">
                        <div>
                          <p className="font-medium">James Miller</p>
                          <p className="text-xs text-slate-500">Lead status: {clientCreated ? 'Qualified' : 'New'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="rounded-2xl" onClick={() => setDraftGenerated(true)}><Bot className="mr-2 h-4 w-4" />AI draft</Button>
                          <Button className="rounded-2xl" onClick={generateEstimate}>Estimate</Button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3 p-4">
                        {conversation.map((m) => (
                          <div key={m.id} className={`flex ${m.role === 'client' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'client' ? 'border bg-white' : m.ai ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>
                              <div className="mb-1 flex items-center gap-2">
                                {m.ai && <Badge variant="secondary" className="bg-white text-slate-900">AI</Badge>}
                                <span className={`text-[11px] ${m.role === 'client' ? 'text-slate-500' : m.ai ? 'text-slate-300' : 'text-slate-600'}`}>{m.time}</span>
                              </div>
                              <p>{m.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 border-t bg-white p-4">
                        {draftGenerated && (
                          <div className="rounded-2xl border border-dashed bg-slate-50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              <p className="text-sm font-medium">AI reply draft</p>
                            </div>
                            <Textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} className="min-h-[90px] rounded-2xl bg-white" />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button className="rounded-2xl" onClick={sendDraft}><Send className="mr-2 h-4 w-4" />Send reply</Button>
                          <Button variant="outline" className="rounded-2xl" onClick={generateEstimate}><ClipboardList className="mr-2 h-4 w-4" />Create estimate</Button>
                          <Button variant="outline" className="rounded-2xl"><ImageIcon className="mr-2 h-4 w-4" />Photo</Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-l bg-white p-4">
                      <Card className="rounded-2xl shadow-none">
                        <CardHeader>
                          <CardTitle className="text-base">Client context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex items-center justify-between"><span className="text-slate-500">Intent</span><Badge variant="secondary">Apartment renovation</Badge></div>
                          <div className="flex items-center justify-between"><span className="text-slate-500">Area</span><span>~50 m²</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-500">Budget</span><span>~$100k</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-500">Urgency</span><span>Medium</span></div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-2xl shadow-none">
                        <CardHeader>
                          <CardTitle className="text-base">AI summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600">
                          Client wants renovation for a 50 m² apartment at 125 Park Avenue. Requested plastering, electrical work, and plumbing. Budget is approximately $100k.
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </Card>
              </Screen>
            )}

            {page === 'estimate' && (
              <Screen
                title="Act 3 — AI estimate builder"
                description="Create a structured estimate in seconds, review it, and send it to the client with an approval CTA."
                right={rightRail}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Estimate draft</CardTitle>
                      <CardDescription>Generated from natural language or voice input using saved standard service templates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        Input example: “Wall plastering 50 m² at 100, floor screed 50 m² at 80, electrical points 20 at 160.”
                      </div>
                      {!estimateReady ? (
                        <Button className="rounded-2xl" onClick={generateEstimate}><Sparkles className="mr-2 h-4 w-4" />Generate estimate now</Button>
                      ) : (
                        <div className="space-y-3">
                          {estimateItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-[1.4fr_80px_90px_120px_120px] items-center gap-3 rounded-2xl border p-3 text-sm">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.unit}</p>
                              </div>
                              <Input value={item.unit} readOnly className="rounded-xl" />
                              <Input value={item.qty} readOnly className="rounded-xl" />
                              <Input value={item.price} readOnly className="rounded-xl" />
                              <div className="font-medium">{currency(item.qty * item.price)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="rounded-3xl shadow-sm">
                      <CardHeader>
                        <CardTitle>Estimate summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Works subtotal</span><span>{currency(estimateTotal)}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Materials</span><span>{currency(0)}</span></div>
                        <Separator />
                        <div className="flex items-center justify-between"><span className="font-medium">Total</span><span className="text-xl font-semibold">{currency(estimateTotal)}</span></div>
                        <div className="space-y-2 pt-2">
                          <Button className="w-full rounded-2xl" onClick={sendEstimate}>Send to client</Button>
                          {estimateSent && <Button variant="outline" className="w-full rounded-2xl" onClick={approveEstimate}>Simulate client approval</Button>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-sm">
                      <CardHeader>
                        <CardTitle>Client view preview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="rounded-2xl border p-4">
                          <p className="font-medium">Renovation estimate</p>
                          <p className="mt-1 text-slate-500">Prepared by {orgName}</p>
                          <div className="mt-3 space-y-2">
                            {estimateItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <span>{item.name}</span>
                                <span>{currency(item.qty * item.price)}</span>
                              </div>
                            ))}
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between font-medium">
                            <span>Total</span>
                            <span>{currency(estimateTotal)}</span>
                          </div>
                          <Button className="mt-4 w-full rounded-2xl" variant={estimateApproved ? 'default' : 'outline'}>
                            {estimateApproved ? 'Approved' : 'Approve estimate'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Screen>
            )}

            {page === 'project' && (
              <Screen
                title="Act 4 — Project delivery and stage approvals"
                description="Once the estimate is approved, the lead becomes a project. The contractor manages stages, uploads photos, and sends work for client acceptance."
                right={rightRail}
              >
                <Tabs defaultValue="stages" className="space-y-4">
                  <TabsList className="rounded-2xl">
                    <TabsTrigger value="stages">Stages</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="acts">Acceptance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stages" className="space-y-4">
                    <Card className="rounded-3xl shadow-sm">
                      <CardHeader>
                        <CardTitle>Project card</CardTitle>
                        <CardDescription>125 Park Avenue · Apartment renovation · Client: James Miller</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
                        <div className="space-y-3">
                          {stages.map((stage) => (
                            <button key={stage.id} onClick={() => setSelectedStage(stage.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedStage === stage.id ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{stage.name}</p>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                              <div className="mt-2 flex items-center justify-between text-sm">
                                <span className={selectedStage === stage.id ? 'text-slate-300' : 'text-slate-500'}>{stage.status}</span>
                                <span>{currency(stage.amount)}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <Card className="rounded-2xl shadow-none">
                          <CardHeader>
                            <CardTitle className="text-lg">{currentStage.name}</CardTitle>
                            <CardDescription>{currentStage.paymentType} · {currency(currentStage.amount)}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <StatCard title="Status" value={currentStage.status} sub="Live stage state" icon={CheckCheck} />
                              <StatCard title="Photos" value={String(currentStage.photos)} sub="Work proof uploaded" icon={ImageIcon} />
                              <StatCard title="Payment rule" value={currentStage.paymentType} sub="Linked to stage" icon={Receipt} />
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Button className="rounded-2xl" onClick={addPhotoToStage}><Plus className="mr-2 h-4 w-4" />Add photos</Button>
                              <Button variant="outline" className="rounded-2xl" onClick={sendForApproval}>Send for acceptance</Button>
                              <Button variant="outline" className="rounded-2xl" onClick={clientAcceptsStage}>Simulate client accepts</Button>
                            </div>
                            <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-600">
                              Client receives stage photos plus two clear actions: <strong>Accept</strong> or <strong>Has comments</strong>. After acceptance, a payment request can be sent automatically.
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="chat">
                    <Card className="rounded-3xl shadow-sm"><CardContent className="p-6 text-sm text-slate-600">Project chat remains connected to the same client thread, so the contractor never loses context between sales and delivery.</CardContent></Card>
                  </TabsContent>
                  <TabsContent value="payments">
                    <Card className="rounded-3xl shadow-sm"><CardContent className="p-6 text-sm text-slate-600">Each stage can have its own payment logic: prepayment, on-completion, or split.</CardContent></Card>
                  </TabsContent>
                  <TabsContent value="acts">
                    <Card className="rounded-3xl shadow-sm"><CardContent className="p-6 text-sm text-slate-600">Acceptance acts can be simplified as chat confirmation in MVP, with photo proof attached.</CardContent></Card>
                  </TabsContent>
                </Tabs>
              </Screen>
            )}

            {page === 'payments' && (
              <Screen
                title="Act 5 — Payment requests"
                description="The client gets a clear payment message and link. Once paid, the dashboard and project state update automatically."
                right={rightRail}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Payment builder</CardTitle>
                      <CardDescription>Optimized for stage-based billing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Stage</p>
                          <Badge variant="secondary">{currentStage.name}</Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Amount</span>
                          <span>{currency(currentStage.amount)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Provider</span>
                          <span>Secure payment link</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl" onClick={requestPayment}>Generate payment link</Button>
                        <Button variant="outline" className="rounded-2xl" onClick={markPaymentPaid}>Simulate paid webhook</Button>
                      </div>
                      {paymentRequested && (
                        <div className="rounded-2xl border border-dashed bg-slate-50 p-4 text-sm">
                          Message sent to client: “Payment for {currentStage.name}: {currency(currentStage.amount)}. Pay now.”
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Client payment preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 rounded-3xl border p-5">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl border p-2"><Wallet className="h-5 w-5" /></div>
                          <div>
                            <p className="font-medium">Payment for {currentStage.name}</p>
                            <p className="text-sm text-slate-500">{currency(currentStage.amount)}</p>
                          </div>
                        </div>
                        <Button className="w-full rounded-2xl">Pay now</Button>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Status</span>
                          <Badge variant={paymentPaid ? 'default' : 'secondary'}>{paymentPaid ? 'Paid' : paymentRequested ? 'Pending' : 'Not requested'}</Badge>
                        </div>
                        {paymentPaid && (
                          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-3 text-sm">
                            <CheckCircle2 className="h-4 w-4" /> Payment received. Contractor notified and dashboard updated.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Screen>
            )}

            {page === 'dashboard' && (
              <Screen
                title="Act 6 — Follow-up and control dashboard"
                description="Track earned revenue, pending payments, active projects, debtors, and AI-generated control tasks."
                right={rightRail}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Earned this month" value={currency(earned)} sub="Payments received" icon={CircleDollarSign} />
                  <StatCard title="Awaiting payment" value={currency(pendingPayments)} sub="Open payment links" icon={Clock3} />
                  <StatCard title="Active projects" value={String(activeProjects)} sub="Current renovation jobs" icon={FolderKanban} />
                  <StatCard title="Debtors" value={paymentRequested && !paymentPaid ? '1' : '0'} sub="Need follow-up" icon={AlertCircle} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Control center</CardTitle>
                      <CardDescription>Automations for estimate follow-ups and pending payment reminders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border p-4">
                        <div>
                          <p className="font-medium">Estimate unanswered for 3 days</p>
                          <p className="text-sm text-slate-500">Generate a polite reminder draft</p>
                        </div>
                        <Button className="rounded-2xl" onClick={generateFollowup}>Generate</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border p-4">
                        <div>
                          <p className="font-medium">Pending payment follow-up</p>
                          <p className="text-sm text-slate-500">Create a task and reminder draft for the contractor</p>
                        </div>
                        <Button className="rounded-2xl" variant="outline" onClick={generateFollowup}>Generate</Button>
                      </div>
                      {followupGenerated && (
                        <div className="rounded-2xl border border-dashed bg-slate-50 p-4 text-sm text-slate-700">
                          Draft: “Hello James, just checking whether you had a chance to review the estimate. Happy to answer any questions.”
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Tasks</CardTitle>
                      <CardDescription>Manual control remains visible even with AI assistance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {taskCreated ? (
                        <div className="flex items-start gap-3 rounded-2xl border p-4">
                          <div className="rounded-xl border p-2"><Bell className="h-4 w-4" /></div>
                          <div>
                            <p className="font-medium">Follow up with James Miller</p>
                            <p className="text-sm text-slate-500">Estimate sent 3 days ago. Confirm next step and payment readiness.</p>
                            <Badge className="mt-2" variant="secondary">Due today</Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                          No control tasks yet. Generate one from the automation panel.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Screen>
            )}

            {page === 'settings' && (
              <Screen
                title="Settings and growth readiness"
                description="Work templates, AI rules, message templates, and integrations for Telegram, WhatsApp, and payments."
                right={rightRail}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Organization profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium">Organization name</p>
                        <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="rounded-2xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-2 text-sm font-medium">Currency</p>
                          <Input value="USD" readOnly className="rounded-2xl" />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Language</p>
                          <Input value="English" readOnly className="rounded-2xl" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>AI rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-2xl border p-4">
                        <span>Draft mode enabled</span>
                        <Badge>Default</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border p-4">
                        <span>Autopilot</span>
                        <Badge variant={autopilot ? 'default' : 'secondary'}>{autopilot ? 'On' : 'Off'}</Badge>
                      </div>
                      <div className="rounded-2xl border p-4">Stop-words: complaint, legal, refund, court</div>
                      <div className="rounded-2xl border p-4">Working hours: 9:00–21:00</div>
                    </CardContent>
                  </Card>
                </div>
              </Screen>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
