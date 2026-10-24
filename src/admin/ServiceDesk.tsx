import { useState } from 'react';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { TicketStatus } from '../types';
import Icon from '../components/Icon';
import { AButton, FieldRow, Kpi, Modal, PageTitle, Tag, field, panel } from './ui';

const COLS: { s: TicketStatus; tone: 'blue' | 'amber' | 'green' | 'gray'; next?: TicketStatus; label?: string }[] = [
  { s: 'Open', tone: 'blue', next: 'In Progress', label: 'Start Repair' },
  { s: 'In Progress', tone: 'amber', next: 'Ready', label: 'Mark Ready' },
  { s: 'Ready', tone: 'green', next: 'Closed', label: 'Hand Over' },
  { s: 'Closed', tone: 'gray' },
];

export default function ServiceDesk() {
  const { tickets, setTicketStatus, addTicket } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ customer: '', phone: '', device: '', issue: '', cost: '' });
  const [error, setError] = useState('');

  const active = tickets.filter((t) => t.status !== 'Closed');
  const revenue = tickets.filter((t) => t.status === 'Closed' || t.status === 'Ready').reduce((n, t) => n + t.cost, 0);

  const create = () => {
    if (f.customer.trim().length < 2 || f.device.trim().length < 2 || f.issue.trim().length < 3) return setError('Customer, device and issue are required');
    addTicket({ customer: f.customer, phone: f.phone || '—', device: f.device, issue: f.issue, cost: Number(f.cost) || 0 });
    setF({ customer: '', phone: '', device: '', issue: '', cost: '' });
    setError('');
    setOpen(false);
  };

  return (
    <div>
      <PageTitle
        title="Care Lab Repair Tickets & Technician Workbench"
        sub="Move devices through the repair workflow. Storefront bookings arrive here automatically."
        actions={<AButton onClick={() => setOpen(true)}><Icon name="plus" size={15} /> New Ticket</AButton>}
      />

      <div className="admin-kpi-grid">
        <Kpi icon="tool" label="Active tickets" value={active.length} tone="amber" delay={0} />
        <Kpi icon="clock" label="Waiting to start" value={tickets.filter((t) => t.status === 'Open').length} delay={70} />
        <Kpi icon="check" label="Ready for pickup" value={tickets.filter((t) => t.status === 'Ready').length} delay={140} />
        <Kpi icon="chart" label="Repair revenue" value={revenue} prefix="₹" delay={210} />
      </div>

      <div className="admin-kanban-grid">
        {COLS.map((col, ci) => {
          const items = tickets.filter((t) => t.status === col.s);
          return (
            <div key={col.s} style={{ ...panel, padding: 14, background: C.tint2, animation: `fadeUp .5s ease ${ci * 80}ms both`, minHeight: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{col.s}</div>
                <Tag tone={col.tone}>{items.length}</Tag>
              </div>
              {items.length === 0 && <div style={{ fontSize: 12.5, color: C.muted, textAlign: 'center', padding: '26px 0' }}>Nothing here</div>}
              {items.map((t) => (
                <div key={t.id} className="lift" style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 12, marginBottom: 10, animation: 'bounceIn .35s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <b>#{t.id}</b>
                    <span style={{ color: C.muted }}>{money(t.cost)}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, margin: '6px 0 2px' }}>{t.device}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{t.issue}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11.5, marginTop: 8, color: C.muted }}>
                    <Icon name="user" size={13} /> {t.customer} · {t.tech}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11.5, marginTop: 3, color: C.muted }}>
                    <Icon name="clock" size={13} /> {t.eta}
                  </div>
                  {col.next && (
                    <div style={{ marginTop: 10 }}>
                      <AButton small variant={col.s === 'In Progress' ? 'accent' : 'soft'} onClick={() => setTicketStatus(t.id, col.next as TicketStatus)}>{col.label}</AButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {open && (
        <Modal title="New Repair Ticket" onClose={() => setOpen(false)} width={520}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FieldRow label="CUSTOMER"><input style={field} value={f.customer} onChange={(e) => setF({ ...f, customer: e.target.value })} /></FieldRow>
              <FieldRow label="PHONE"><input style={field} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></FieldRow>
            </div>
            <FieldRow label="DEVICE"><input style={field} value={f.device} onChange={(e) => setF({ ...f, device: e.target.value })} placeholder="e.g. OnePlus 11 5G" /></FieldRow>
            <FieldRow label="ISSUE"><input style={field} value={f.issue} onChange={(e) => setF({ ...f, issue: e.target.value })} placeholder="e.g. Display replacement" /></FieldRow>
            <FieldRow label="ESTIMATED COST (₹)"><input style={field} type="number" min={0} value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></FieldRow>
            {error && <div style={{ color: C.danger, fontWeight: 700, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <AButton variant="ghost" onClick={() => setOpen(false)}>Cancel</AButton>
              <AButton onClick={create}>Create Ticket</AButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
