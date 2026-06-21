/* ============================================
   SOPsMind — JavaScript Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initScrollAnimations();
    initCounters();
    initCardExpanders();
    initAssessment();
    initContactForm();
});

/* ============================================
   PARTICLE BACKGROUND
   ============================================ */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 25 : 60;
    const CONNECTION_DIST = isMobile ? 100 : 150;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 245, 212, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 245, 212, ${0.06 * (1 - dist / CONNECTION_DIST)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveLink();
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on overlay click (touch outside)
    navLinks.addEventListener('click', (e) => {
        if (e.target === navLinks) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id], .system-group[id]');
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 200) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.classList.add('active');
            }
        });
    }
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach((el, index) => {
        el.dataset.delay = (index % 4) * 100;
        observer.observe(el);
    });
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    let triggered = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.count);
                    let current = 0;
                    const duration = 2000;
                    const step = target / (duration / 16);

                    function updateCounter() {
                        current += step;
                        if (current >= target) {
                            counter.textContent = target;
                        } else {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        }
                    }
                    updateCounter();
                });
            }
        });
    }, { threshold: 0.5 });

    if (counters.length > 0) {
        observer.observe(counters[0].closest('.hero-stats'));
    }
}

/* ============================================
   CARD EXPANDERS
   ============================================ */
function initCardExpanders() {
    document.querySelectorAll('.card-expand').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const detail = document.getElementById(targetId);

            // Close all others
            document.querySelectorAll('.card-detail.open').forEach(d => {
                if (d.id !== targetId) {
                    d.classList.remove('open');
                    const otherBtn = document.querySelector(`[data-target="${d.id}"]`);
                    if (otherBtn) otherBtn.classList.remove('active');
                }
            });

            // Toggle current
            detail.classList.toggle('open');
            btn.classList.toggle('active');
        });
    });
}

/* ============================================
   SELF-ASSESSMENT QUIZ
   ============================================ */
function initAssessment() {
    const questions = [
        {
            text: "عندما يقول لك أحدهم 'هذا مستحيل'، ما ردة فعلك الأولى؟",
            category: 0, // قراءة البيئة
            options: [
                { text: "أشعر بالإحباط وأبدأ بالشك في نفسي", score: 1 },
                { text: "أتجاهل الكلام وأكمل دون تحليل", score: 2 },
                { text: "أحلل الكلمة وأترجمها إلى 'يتطلب مساراً بديلاً'", score: 4 },
                { text: "أحوّلها فوراً إلى بيانات وأبحث عن المسار البديل", score: 5 }
            ]
        },
        {
            text: "كيف تتعامل مع التجارب السلبية السابقة؟",
            category: 1, // تخزين البيانات
            options: [
                { text: "أحاول نسيانها تماماً", score: 1 },
                { text: "تظل عالقة وتؤثر على قراراتي عاطفياً", score: 2 },
                { text: "أوثقها كملاحظات عامة", score: 3 },
                { text: "أحللها بموضوعية كدراسة حالة وأحتفظ بالدروس فقط", score: 5 }
            ]
        },
        {
            text: "عندما تواجه عقبة في بيئة عملك، كيف تصنّفها؟",
            category: 0, // قراءة البيئة
            options: [
                { text: "لا أصنّف العقبات، أتعامل معها كلها بنفس الطريقة", score: 1 },
                { text: "أحاول حل كل شيء بنفسي", score: 2 },
                { text: "أفرّق بين ما أستطيع حله وما لا أستطيع", score: 3 },
                { text: "أصنّفها فوراً: قابلة للإزالة / تتطلب التفاف / تحتاج تجاهلاً تاماً", score: 5 }
            ]
        },
        {
            text: "ما مدى استحضارك لرؤيتك وهدفك النهائي يومياً؟",
            category: 1, // تخزين البيانات
            options: [
                { text: "ليس لدي هدف واضح", score: 1 },
                { text: "أفكر فيه أحياناً فقط", score: 2 },
                { text: "أتذكره كل بضعة أيام", score: 3 },
                { text: "أستحضره يومياً صباحاً وأربط كل مهمة به", score: 5 }
            ]
        },
        {
            text: "كيف تتعامل مع وقتك وطاقتك اليومية؟",
            category: 2, // التركيز
            options: [
                { text: "أنفقها بعشوائية ولا أخطط", score: 1 },
                { text: "أحاول التنظيم لكنني أنجرف كثيراً في جدالات ونقاشات", score: 2 },
                { text: "أخطط لكنني أسمح بالمقاطعات", score: 3 },
                { text: "أعاملهما كرأس مال محدود ولا أنفق دقيقة واحدة في ما لا يخدم خطتي", score: 5 }
            ]
        },
        {
            text: "عند مواجهة نقص في الموارد، ما موقفك؟",
            category: 3, // الابتكار
            options: [
                { text: "أتوقف وأنتظر حتى تتوفر الموارد", score: 1 },
                { text: "أشكو من الوضع وألوم البيئة", score: 1 },
                { text: "أبحث عن بدائل تقليدية", score: 3 },
                { text: "أقلب النقص إلى ميزة وأبتكر حلاً منخفض التكلفة", score: 5 }
            ]
        },
        {
            text: "كيف تقيّم أداءك ومستواك الحقيقي؟",
            category: 4, // التقييم
            options: [
                { text: "بناءً على رأي الآخرين فيّ", score: 1 },
                { text: "بمقارنة نفسي بمن حولي فقط", score: 2 },
                { text: "بنتائج غير محددة وغير قابلة للقياس", score: 2 },
                { text: "بمؤشرات مادية قابلة للقياس (أرقام، إنجازات، شهادات) ومقارنة بالمعايير العالمية", score: 5 }
            ]
        },
        {
            text: "هل تفرض على نفسك فترات عزلة للعمل المركّز؟",
            category: 2, // التركيز
            options: [
                { text: "لا أستطيع العمل بدون تواصل مع الآخرين", score: 1 },
                { text: "أحاول لكنني أفشل غالباً", score: 2 },
                { text: "أفعل ذلك أحياناً عند الضرورة القصوى", score: 3 },
                { text: "أفرض فترات إغلاق صارمة يومياً للمهام الحساسة", score: 5 }
            ]
        },
        {
            text: "كيف تتعامل مع العلاقات السلبية في بيئتك؟",
            category: 3, // الابتكار
            options: [
                { text: "أدخل في صدامات مباشرة تستنزف طاقتي", score: 1 },
                { text: "أتأثر بهم عاطفياً وأنسحب", score: 2 },
                { text: "أتجنبهم قدر المستطاع", score: 3 },
                { text: "أحوّلهم إلى مصادر معلومات فقط دون تأثر عاطفي", score: 5 }
            ]
        },
        {
            text: "هل تطبّق تحسينات يومية صغيرة (1%) على أدائك؟",
            category: 4, // التقييم
            options: [
                { text: "لا أعرف كيف أبدأ", score: 1 },
                { text: "أحاول لكن بشكل متقطع", score: 2 },
                { text: "أطبق تحسينات أسبوعية", score: 3 },
                { text: "أطبّق تحسيناً دقيقاً كل يوم وأوثقه", score: 5 }
            ]
        }
    ];

    const categories = [
        { name: "قراءة البيئة وفك تشفيرها", color: "#00F5D4", maxScore: 10 },
        { name: "تخزين البيانات وتوظيفها", color: "#7B61FF", maxScore: 10 },
        { name: "التركيز وإيجاد الحل الأمثل", color: "#4EA8DE", maxScore: 10 },
        { name: "الابتكار والمناورة", color: "#FFB347", maxScore: 10 },
        { name: "التقييم والرقابة", color: "#FF6B9D", maxScore: 10 }
    ];

    let currentQuestion = 0;
    let answers = new Array(questions.length).fill(null);

    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const progressFill = document.getElementById('assessment-progress');
    const progressText = document.getElementById('progress-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const assessmentArea = document.getElementById('assessment-area');
    const assessmentResult = document.getElementById('assessment-result');
    const resultDetails = document.getElementById('result-details');
    const retryBtn = document.getElementById('retry-btn');

    function renderQuestion() {
        const q = questions[currentQuestion];
        questionText.textContent = q.text;
        answerOptions.innerHTML = '';

        q.options.forEach((option, idx) => {
            const div = document.createElement('div');
            div.className = 'answer-option';
            if (answers[currentQuestion] === idx) {
                div.classList.add('selected');
            }
            div.textContent = option.text;
            div.addEventListener('click', () => {
                answers[currentQuestion] = idx;
                renderQuestion();
            });
            answerOptions.appendChild(div);
        });

        // Update progress
        const progress = ((currentQuestion + 1) / questions.length) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = `السؤال ${currentQuestion + 1} من ${questions.length}`;

        // Buttons
        prevBtn.disabled = currentQuestion === 0;
        nextBtn.textContent = currentQuestion === questions.length - 1 ? 'عرض النتائج' : 'التالي';
    }

    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (answers[currentQuestion] === null) {
            // Highlight that an answer is needed
            answerOptions.style.animation = 'none';
            answerOptions.offsetHeight;
            answerOptions.style.animation = '';
            return;
        }

        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        // Calculate scores per category
        const scores = [0, 0, 0, 0, 0];
        answers.forEach((ansIdx, qIdx) => {
            if (ansIdx !== null) {
                const cat = questions[qIdx].category;
                scores[cat] += questions[qIdx].options[ansIdx].score;
            }
        });

        // Hide questions, show results
        assessmentArea.style.display = 'none';
        document.querySelector('.assessment-nav').style.display = 'none';
        document.querySelector('.assessment-progress').style.display = 'none';
        assessmentResult.style.display = 'block';

        // Draw radar chart
        drawRadarChart(scores, categories);

        // Show details
        resultDetails.innerHTML = '';
        categories.forEach((cat, idx) => {
            const pct = Math.round((scores[idx] / cat.maxScore) * 100);
            const level = pct >= 80 ? 'ممتاز' : pct >= 60 ? 'جيد' : pct >= 40 ? 'متوسط' : 'يحتاج تحسين';
            const div = document.createElement('div');
            div.className = 'result-category';
            div.innerHTML = `
                <div class="result-dot" style="background:${cat.color}"></div>
                <span class="result-label">${cat.name}</span>
                <span class="result-score" style="color:${cat.color}">${pct}%</span>
                <div class="result-bar">
                    <div class="result-bar-fill" style="width:0%;background:${cat.color}"></div>
                </div>
            `;
            resultDetails.appendChild(div);

            // Animate bar
            setTimeout(() => {
                div.querySelector('.result-bar-fill').style.width = pct + '%';
            }, 300 + idx * 200);
        });

        // Overall score
        const totalScore = scores.reduce((a, b) => a + b, 0);
        const totalMax = categories.reduce((a, b) => a + b.maxScore, 0);
        const overallPct = Math.round((totalScore / totalMax) * 100);

        const overall = document.createElement('div');
        overall.className = 'result-category';
        overall.style.marginTop = '20px';
        overall.style.borderTop = '1px solid rgba(255,255,255,0.06)';
        overall.style.paddingTop = '20px';
        overall.innerHTML = `
            <div class="result-dot" style="background: linear-gradient(135deg, #00F5D4, #7B61FF)"></div>
            <span class="result-label" style="font-weight:700;font-size:1.05rem">النتيجة الإجمالية</span>
            <span class="result-score" style="background: linear-gradient(135deg, #00F5D4, #7B61FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size:1.3rem">${overallPct}%</span>
            <div class="result-bar" style="height:10px">
                <div class="result-bar-fill" style="width:0%;background:linear-gradient(90deg,#00F5D4,#7B61FF)"></div>
            </div>
        `;
        resultDetails.appendChild(overall);

        setTimeout(() => {
            overall.querySelector('.result-bar-fill').style.width = overallPct + '%';
        }, 1500);
    }

    function drawRadarChart(scores, categories) {
        const canvas = document.getElementById('result-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Responsive radar chart sizing
        const chartContainer = canvas.parentElement;
        const containerWidth = chartContainer ? chartContainer.offsetWidth : 300;
        const size = Math.min(containerWidth, window.innerWidth <= 480 ? 220 : window.innerWidth <= 768 ? 260 : 300);
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';

        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.37;
        const levels = 5;
        const n = categories.length;

        ctx.clearRect(0, 0, size, size);

        // Draw grid
        for (let l = 1; l <= levels; l++) {
            const r = (radius / levels) * l;
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axes
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Labels
            const labelR = radius + 25;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);
            ctx.font = '10px Tajawal';
            ctx.fillStyle = categories[i].color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Shorter labels for chart
            const shortLabels = ['البيئة', 'التخزين', 'التركيز', 'الابتكار', 'التقييم'];
            ctx.fillText(shortLabels[i], lx, ly);
        }

        // Draw data
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
            const idx = i % n;
            const angle = (Math.PI * 2 / n) * idx - Math.PI / 2;
            const val = scores[idx] / categories[idx].maxScore;
            const r = radius * val;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Fill
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, 'rgba(0, 245, 212, 0.15)');
        gradient.addColorStop(1, 'rgba(123, 97, 255, 0.15)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw points
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
            const val = scores[i] / categories[i].maxScore;
            const r = radius * val;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = categories[i].color;
            ctx.fill();
            ctx.strokeStyle = '#0a0a0f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    retryBtn.addEventListener('click', () => {
        currentQuestion = 0;
        answers = new Array(questions.length).fill(null);
        assessmentArea.style.display = 'block';
        document.querySelector('.assessment-nav').style.display = 'flex';
        document.querySelector('.assessment-progress').style.display = 'block';
        assessmentResult.style.display = 'none';
        renderQuestion();
    });

    // Initial render
    renderQuestion();
}

/* ============================================
   CONTACT FORM — Google Sheets Integration
   ============================================ */
/*
 * ⚠️ هام: استبدل الرابط أدناه برابط تطبيق الويب (Web App URL)
 *    الذي تحصل عليه بعد نشر Google Apps Script.
 *    راجع التعليمات في الخطوة 3 أدناه.
 */
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxDPP1dXr-6K2S4JUiE1PKFMjDHcUrwoF36HI1aUkJPA2XhnxD2RZvMKYm06ehCEs-PoQ/exec';

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const btnIcon = submitBtn.querySelector('.btn-icon');

    // Toast notification helper
    function showNotification(message, isSuccess = true) {
        const notification = document.getElementById('form-notification');
        const notificationText = document.getElementById('notification-text');
        const notificationIcon = document.getElementById('notification-icon');

        notificationText.textContent = message;
        notification.classList.remove('show', 'success', 'error');

        // Set icon based on success/error
        if (isSuccess) {
            notification.classList.add('success');
            notificationIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
        } else {
            notification.classList.add('error');
            notificationIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>`;
        }

        // Trigger show
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    // Toggle loading state
    function setLoading(loading) {
        if (loading) {
            btnText.style.display = 'none';
            btnIcon.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'wait';
        } else {
            btnText.style.display = '';
            btnIcon.style.display = '';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '';
            submitBtn.style.cursor = '';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if URL is configured
        if (GOOGLE_SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            showNotification('⚠️ يرجى إعداد رابط Google Apps Script أولاً.', false);
            console.error(
                'SOPsMind: لم يتم تعيين رابط Google Apps Script.\n' +
                'استبدل قيمة GOOGLE_SHEETS_URL في ملف script.js برابط Web App الخاص بك.'
            );
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(form);

            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                body: formData,
            });

            if (response.ok || response.type === 'opaque') {
                // Google Apps Script redirects often return opaque responses
                showNotification('✅ تم إرسال طلبك بنجاح! سنتواصل معك قريباً.', true);
                form.reset();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            // For no-cors mode, the fetch may appear to "fail" but actually succeeds.
            // Google Apps Script web apps typically need no-cors from external domains.
            // Retry with no-cors if standard fetch fails:
            try {
                const formData = new FormData(form);

                await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors',
                });

                // With no-cors we can't verify the response, but the data was likely sent
                showNotification('✅ تم إرسال طلبك بنجاح! سنتواصل معك قريباً.', true);
                form.reset();
            } catch (retryError) {
                console.error('Form submission error:', retryError);
                showNotification('❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', false);
            }
        } finally {
            setLoading(false);
        }
    });
}

/* ============================================
   SMOOTH SCROLL for anchors
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth'
            });
        }
    });
});
