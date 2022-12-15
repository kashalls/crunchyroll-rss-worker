export function attachDebug(req) {
    const { searchParams } = new URL(req.url);
  
    const debug = {};
  
    const incidentId = searchParams.get('updateIncident');
    if (incidentId !== null) {
      debug.updateIncident = incidentId;
    }
  
    globalThis.DEBUG = debug;
  }

export function getDebug() {
    if (globalThis.DEBUG) {
      return globalThis.DEBUG
    }
    return null;
  }
  