import AdminInbox from '@/components/admin/AdminInbox';

export default function InboxPage() {
  return (
    <div className="inbox-fullscreen" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .inbox-fullscreen {
          margin: -2rem -1rem -3rem !important;
          width: calc(100% + 2rem) !important;
          max-width: none !important;
        }
        @media (min-width: 768px) {
          .inbox-fullscreen {
            margin: -3rem -2rem -3rem !important;
            width: calc(100% + 4rem) !important;
          }
        }
      `}</style>
      <AdminInbox />
    </div>
  );
}
