import React, { useState, useEffect } from 'react';
import { getOrders } from '../localStore';
import { CheckCircle2, XCircle, Clock, Search, RefreshCw, Package } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  verified:  { label: 'Verified',   color: 'text-accent',       bg: 'bg-accent/10 border-accent/30',           icon: CheckCircle2 },
  paid:      { label: 'Paid',       color: 'text-primary',      bg: 'bg-primary/10 border-primary/30',         icon: Clock },
  cancelled: { label: 'Cancelled',  color: 'text-destructive',  bg: 'bg-destructive/10 border-destructive/30', icon: XCircle },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const loadOrders = () => setOrders(getOrders());

  useEffect(() => { loadOrders(); }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      o.transaction_id?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.store_name?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total:    orders.length,
    verified: orders.filter(o => o.status === 'verified').length,
    paid:     orders.filter(o => o.status === 'paid').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-foreground', bg: 'bg-card border-border' },
          { label: 'Verified', value: stats.verified, color: 'text-accent',     bg: 'bg-accent/10 border-accent/30' },
          { label: 'Pending',  value: stats.paid,     color: 'text-primary',    bg: 'bg-primary/10 border-primary/30' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl px-3 py-2.5 text-center`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by TXN, customer, store..."
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'verified', 'paid', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={loadOrders}
            className="px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2 pb-4">
          <AnimatePresence>
            {filtered.map((order, i) => {
              const cfg = statusConfig[order.status] || statusConfig.paid;
              const Icon = cfg.icon;
              const isOpen = expanded === order.id;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-card border rounded-xl overflow-hidden cursor-pointer ${isOpen ? 'border-primary/40' : 'border-border hover:border-border/80'}`}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} border`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {order.customer_name || 'Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{order.transaction_id}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">
                        {order.currency === 'INR' ? '₹' : '$'}{order.total_amount?.toFixed(2)}
                      </p>
                      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border px-4 py-3 space-y-2 bg-secondary/40"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Store</p>
                          <p className="text-foreground font-medium">{order.store_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment</p>
                          <p className="text-foreground font-medium capitalize">{order.payment_method || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Order Date</p>
                          <p className="text-foreground font-medium">
                            {order.created_date ? format(new Date(order.created_date), 'dd MMM yy, hh:mm a') : '—'}
                          </p>
                        </div>
                        {order.verified_date && (
                          <div>
                            <p className="text-muted-foreground">Verified At</p>
                            <p className="text-accent font-medium">
                              {format(new Date(order.verified_date), 'dd MMM yy, hh:mm a')}
                            </p>
                          </div>
                        )}
                      </div>
                      {order.items?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Items ({order.items.length})</p>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs bg-secondary rounded-lg px-2.5 py-1.5">
                                <span className="text-foreground">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                                <span className="text-primary font-semibold">
                                  {order.currency === 'INR' ? '₹' : '$'}{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}