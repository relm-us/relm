export function upsertScript(id, body) {
  let script: HTMLScriptElement = document.getElementById(id) as HTMLScriptElement;
  const needsUpdate = !script || script.innerHTML !== body;

  if (needsUpdate) {
    if (script) {
      // If the script exists but needs an update, remove it first
      script.remove();
    }
    // Create a new script element whether it was removed or didn't exist
    script = document.createElement('script');
    script.setAttribute('strategy', 'afterInteractive')
    script.id = id;
    script.innerHTML = body;
    document.body.appendChild(script);
  }
}

