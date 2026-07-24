// TikTok Live Reader Thai - Interactive Live Simulator & Web Script

document.addEventListener('DOMContentLoaded', () => {
    const chatStream = document.getElementById('chat-stream');
    const btnComment = document.getElementById('btn-demo-comment');
    const btnGift = document.getElementById('btn-demo-gift');
    const btnSfx = document.getElementById('btn-demo-sfx');
    const voiceSelect = document.getElementById('voice-select');

    // Sample data for simulation
    const sampleUsers = ['Somchai_Live', 'Nong_Ploy99', 'Boss_Krub', 'Somsak_TikTok', 'Manao_Studio'];
    const sampleComments = [
        'สวัสดีครับพี่ ชัดเจนมากเลยครับ!',
        'ภาพสวย เสียงชัดเจนดีครับ',
        'แชร์ไลฟ์สดให้แล้วนะครับ',
        'ติดตามช่องใหม่แล้วครับผม',
        'ขอเพลงสากลตลกๆ สักเพลงได้ไหมครับ'
    ];
    const sampleGifts = [
        { name: 'หัวใจ (Heart)', val: '1 Coins' },
        { name: 'ดอกกุหลาบ (Rose)', val: '5 Coins' },
        { name: 'TikTok Cap', val: '99 Coins' },
        { name: 'สปอนเซอร์ใหญ่ (Lion)', val: '500 Coins' }
    ];

    let systemVoices = [];
    let currentAudioEl = null;

    // Load voices
    function initVoices() {
        if ('speechSynthesis' in window) {
            systemVoices = window.speechSynthesis.getVoices() || [];
        }
    }
    initVoices();
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = initVoices;
    }

    // Play Online Google MP3 Audio with No-Referrer Policy
    function playOnlineGoogleTTS(text, pitchOffset = 1.0, rateOffset = 1.0) {
        return new Promise((resolve, reject) => {
            if (currentAudioEl) {
                try { currentAudioEl.pause(); } catch(e){}
                currentAudioEl = null;
            }

            const encoded = encodeURIComponent(text);
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th&q=${encoded}`;
            
            const audio = new Audio();
            audio.referrerPolicy = "no-referrer"; // Bypasses CORS referer blocks
            audio.crossOrigin = "anonymous";
            audio.src = ttsUrl;
            audio.playbackRate = rateOffset;
            
            currentAudioEl = audio;

            audio.onended = () => resolve();
            audio.onerror = (e) => reject(e);

            audio.play().then(() => resolve()).catch(err => reject(err));
        });
    }

    // Web Speech API Fallback with Pitch & Speed adjustment
    function playWebSpeech(text, selectedVal) {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (selectedVal === 'th-TH-NiwatNeural') {
            utterance.pitch = 0.6; // Male tone
            utterance.rate = 0.9;
        } else if (selectedVal === 'th-TH-AcharaNeural') {
            utterance.pitch = 1.4; // Girl tone
            utterance.rate = 1.1;
        } else if (selectedVal === 'preset_robot') {
            utterance.pitch = 0.2;
            utterance.rate = 0.7;
        } else if (selectedVal === 'preset_fast') {
            utterance.pitch = 1.1;
            utterance.rate = 1.6;
        }

        // Attach Thai voice if available
        if (systemVoices.length > 0) {
            const thV = systemVoices.find(v => v.lang.includes('th') || v.name.includes('Thai') || v.name.includes('Premwadee') || v.name.includes('Niwat'));
            if (thV) utterance.voice = thV;
        }

        window.speechSynthesis.speak(utterance);
    }

    // Main Speak Controller
    async function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
        }

        const selectedVal = voiceSelect ? voiceSelect.value : 'th-TH-PremwadeeNeural';

        let pitchOffset = 1.0;
        let rateOffset = 1.0;

        if (selectedVal === 'preset_robot') {
            pitchOffset = 0.5;
            rateOffset = 0.8;
        } else if (selectedVal === 'preset_fast') {
            rateOffset = 1.4;
        }

        try {
            // Attempt Online MP3 Audio First
            await playOnlineGoogleTTS(text, pitchOffset, rateOffset);
        } catch (e) {
            console.log("Online MP3 fallback to WebSpeech:", e);
            playWebSpeech(text, selectedVal);
        }
    }

    // Sound Synthesizer for SFX demo (Audio Context)
    function playRimshotSynth() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
            console.log('Audio synth error:', e);
        }
    }

    // Add message to chat box
    function appendChatMessage(htmlContent, className = '') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${className}`;
        msgDiv.innerHTML = htmlContent;
        chatStream.appendChild(msgDiv);
        chatStream.scrollTop = chatStream.scrollHeight;
    }

    // Demo Button Handlers
    btnComment.addEventListener('click', () => {
        if ('speechSynthesis' in window) window.speechSynthesis.resume();
        const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        appendChatMessage(`<span class="user">${user}</span> พิมพ์ว่า: ${comment}`);
        speakText(`${user} พิมพ์ว่า ${comment}`);
    });

    btnGift.addEventListener('click', () => {
        if ('speechSynthesis' in window) window.speechSynthesis.resume();
        const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const gift = sampleGifts[Math.floor(Math.random() * sampleGifts.length)];
        
        appendChatMessage(`🎁 <span class="user">${user}</span> ส่งของขวัญ ${gift.name} (${gift.val})`, 'msg-gift');
        speakText(`ขอบคุณสำหรับของขวัญ ${gift.name} จากคุณ ${user} นะคะ ขอให้เฮงๆ รวยๆ ครับ`);
    });

    btnSfx.addEventListener('click', () => {
        if ('speechSynthesis' in window) window.speechSynthesis.resume();
        playRimshotSynth();
        appendChatMessage(`🎵 [ซาวด์บอร์ด Alt+F5] ตึ่งโป๊ะ!`, 'msg-sfx');
    });

    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
