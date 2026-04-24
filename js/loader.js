/* ========================================
   LOADER
======================================== */
const loaderBody = document.getElementById('loaderBody');
const loaderEl = document.getElementById('loader');
const loaderLines = [
    { text: 'initializing system...', delay: 200 },
    { text: 'loading modules ████████████ 100%', delay: 600 },
    { text: 'compiling shaders... done.', delay: 400 },
    { text: 'mounting neural weights... done.', delay: 500 },
    { text: 'ready. welcome, visitor.', delay: 300 },
];

async function runLoader() {
    for (let i = 0; i < loaderLines.length; i++) {
        const line = loaderLines[i];
        const el = document.createElement('div');
        el.className = 'loader-line';
        el.innerHTML = `<span class="prompt">❯ </span><span class="cmd"></span>`;
        el.style.animationDelay = '0s';
        loaderBody.appendChild(el);

        const cmdEl = el.querySelector('.cmd');
        for (let c = 0; c < line.text.length; c++) {
            cmdEl.textContent += line.text[c];
            await sleep(18 + Math.random() * 12);
        }
        el.classList.add('done');
        await sleep(line.delay);
    }
    await sleep(400);
    loaderEl.classList.add('done');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
runLoader();
