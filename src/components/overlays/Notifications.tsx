import { useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useAetherStore, type Notification } from '@/state/store';

const TONE_ICON = {
  info: 'info',
  success: 'check',
  warning: 'info',
} as const;

function Toast({ notification }: { notification: Notification }) {
  const dismiss = useAetherStore((state) => state.dismissNotification);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(notification.id), 4200);
    return () => window.clearTimeout(timer);
  }, [dismiss, notification.id]);

  return (
    <div className="aether-panel flex w-72 items-start gap-2 px-3 py-2.5 shadow-xl">
      <Icon name={TONE_ICON[notification.tone]} size={14} className="mt-0.5 shrink-0 text-[var(--aether-accent)]" />
      <p className="flex-1 text-[11px] leading-snug text-[var(--aether-text-muted)]">{notification.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(notification.id)}
        className="text-[var(--aether-text-dim)] hover:text-[var(--aether-text)]"
      >
        <Icon name="close" size={12} />
      </button>
    </div>
  );
}

/** Transient feedback for scenario, layer, view and settings actions. */
export function Notifications() {
  const notifications = useAetherStore((state) => state.notifications);
  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-[74px] right-3 z-[70] flex flex-col gap-2" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} />
        </div>
      ))}
    </div>
  );
}
