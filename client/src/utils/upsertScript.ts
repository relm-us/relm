export function upsertScript(id, src, async, ackeeServer, ackeeDomainId) {
  let script: HTMLScriptElement = document.getElementById(id) as HTMLScriptElement;
  const needsUpdate = !script || script.src !== src ||
    script.getAttribute('data-ackee-server') !== ackeeServer ||
    script.getAttribute('data-ackee-domain-id') !== ackeeDomainId;

  if (needsUpdate) {
    if (script) {
      // If the script exists but needs an update, remove it first
      script.remove();
    }
    // Create a new script element whether it was removed or didn't exist
    script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = async;
    script.setAttribute('data-ackee-server', ackeeServer);
    script.setAttribute('data-ackee-domain-id', ackeeDomainId);
    document.body.appendChild(script);
  }
}

