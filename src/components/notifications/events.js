export const EVENTS = {
  UPLOAD_DONE: 'upload.process.completed',
  REPORT_READY: 'report.ready',
  DEADLINE_REMINDER: 'deadline.reminder',
};

export function mapTelemetryToNotification(evt) {
  const detail = evt?.detail || {};
  const type = detail.type || detail.event;
  const payload = detail.payload || detail.meta || {};

  switch (type) {
    case EVENTS.UPLOAD_DONE:
      return { type: 'success', title: 'Upload fertig', meta: payload };
    case EVENTS.REPORT_READY:
      return { type: 'info', title: 'Bericht bereit', meta: payload };
    case EVENTS.DEADLINE_REMINDER:
      return { type: 'warning', title: 'Frist erinnert', meta: payload };
    default:
      return null;
  }
}
