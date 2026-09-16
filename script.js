const input = document.getElementById('scriptInput');
const lineNumbers = document.getElementById('lineNumbers');
const lineCount = document.getElementById('lineCount');
const charCount = document.getElementById('charCount');
const hostButton = document.getElementById('hostButton');
const resultBox = document.getElementById('resultBox');
const rawUrl = document.getElementById('rawUrl');
const scriptId = document.getElementById('scriptId');
const openRaw = document.getElementById('openRaw');
const copyScript = document.getElementById('copyScript');
const toast = document.getElementById('toast');

function updateEditor() {
  const value = input.value;
  const lines = Math.max(1, value.split('\n').length);
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  lineCount.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
  charCount.textContent = `${value.length.toLocaleString('pt-BR')} characters`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1900);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('copied to clipboard');
  } catch {
    showToast('não foi possível copiar');
  }
}

input.addEventListener('input', updateEditor);
input.addEventListener('scroll', () => { lineNumbers.scrollTop = input.scrollTop; });

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', () => copyText(document.getElementById(button.dataset.copy).value));
});

copyScript.addEventListener('click', () => copyText(input.value));

hostButton.addEventListener('click', async () => {
  const script = input.value.trim();
  if (!script) {
    showToast('cole um script primeiro');
    input.focus();
    return;
  }

  hostButton.disabled = true;
  hostButton.querySelector('span:first-child').textContent = 'hosting...';
  resultBox.classList.add('hidden');

  try {
    const response = await fetch('/api/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'erro ao hospedar o script');

    rawUrl.value = data.rawUrl;
    scriptId.value = data.id;
    openRaw.href = data.rawUrl;
    resultBox.classList.remove('hidden');
    showToast('script hospedado com sucesso');
  } catch (error) {
    showToast(error.message || 'erro ao hospedar');
  } finally {
    hostButton.disabled = false;
    hostButton.querySelector('span:first-child').textContent = 'host script';
  }
});

updateEditor();
