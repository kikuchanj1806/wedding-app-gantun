// public/js/toggle-icon.js
(function ($) {
    const X_PATH    = 'M368 368 144 144m224 0L144 368';
    const MENU_PATH = 'M88 152h336M88 256h336M88 360h336';

    const $watermarks = $('.jsx-3116023621.watermark');
    const $appView    = $('#app-view-index.jsx-3116023621'); // phần tử cần toggle hide-toolbar

    function setAttrs($el, attrs = {}, remove = []) {
        Object.entries(attrs).forEach(([k, v]) => $el.attr(k, v));
        remove.forEach(k => $el.removeAttr(k));
    }
    const isX = ($p) => $p.attr('d') === X_PATH;
    const toMenu = ($p) => setAttrs($p, { d: MENU_PATH, 'stroke-miterlimit': '10', 'stroke-width': '48' }, ['stroke-linejoin']);
    const toX    = ($p) => setAttrs($p, { d: X_PATH, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '32' }, ['stroke-miterlimit']);

    $(function () {
        // con trỏ tay cho dễ bấm
        $(document).on('mouseenter', '.toolbar-toggle-button', function () {
            $(this).css({ cursor: 'pointer' });
        });

        // Khởi tạo class ẩn/hiện theo trạng thái icon hiện có (nếu cần)
        $('.iconPath').each(function () {
            const menuState = !isX($(this)); // đang là menu => cần ẩn
            $watermarks.toggleClass('hide-toolbar-content', menuState);
            $appView.toggleClass('hide-toolbar', menuState);
        });

        // Toggle khi click
        $(document).on('click', '.iconPath', function () {
            console.log('run icon path')
            const $path = $(this);
            const nextIsMenu = isX($path); // hiện tại là X => sau click thành menu

            if (nextIsMenu) toMenu($path); else toX($path);

            // Đồng bộ 2 nhóm target
            $watermarks.toggleClass('hide-toolbar-content', nextIsMenu);
            $appView.toggleClass('hide-toolbar', nextIsMenu);
        });
    });
})(jQuery);

(function ($) {
    $(function () {
        const $box = $('#blessing-box');
        if (!$box.length) return;

        // Lấy danh sách item gốc
        const $items = $box.children('.blessing-message');
        if (!$items.length) return;

        // Thêm class nhận diện và tạo track
        $box.addClass('ticker');
        const $track = $('<div class="ticker-track"></div>');

        // Đưa 1 bản gốc + 1 bản clone để loop liền mạch
        // (Nếu muốn mượt hơn với nội dung dài, có thể clone 2 lần)
        const $original = $items.clone(true, true);
        $track.append($items);

        // Đưa track vào box
        $box.empty().append($track);

        // Tính tổng chiều cao của "nửa track" (tức phần original)
        let halfHeight = 0;
        $track.children().each(function (i) {
            if (i < $original.length) {
                halfHeight += $(this).outerHeight(true);
            }
        });

        // Tốc độ cuộn: px/giây (chỉnh tùy ý)
        const speed = 40; // 40 px/s
        const durationSec = Math.max(halfHeight / speed, 4); // tối thiểu 4s cho đỡ chóng mặt

        // Gán biến thời lượng cho animation
        $track.css('--dur', `${durationSec}s`);

        // Nếu nội dung thay đổi động (append thêm lời chúc), có thể gọi lại logic tính halfHeight + cập nhật --dur
    });
})(jQuery);

(function ($) {
    $(document).on('click', '.message-box-button', function (e) {
        e.preventDefault();

        const $container = $('#app-view-index');

        // Chỉ thêm backdrop nếu chưa có
        if (!$container.find('.popup-backdrop.jsx-831600802').length) {
            $container.append('<div class="jsx-831600802 popup-backdrop fade-enter-done"></div>');
        }

        // Thêm class active cho popup wrapper
        $('.popup-wrapper.jsx-831600802').addClass('active');
    });

    /* (Tuỳ chọn) Đóng popup khi click backdrop */
    $(document).on('click', '#app-view-index .popup-backdrop.jsx-831600802', function () {
        $(this).remove();
        $('.popup-wrapper.jsx-831600802').removeClass('active');
    });

    $(document).on('click', '.jsx-3319829800.iconfont.icon-guanbi', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // gỡ backdrop trong #app-view-index (nếu có nhiều thì gỡ hết)
        $('#app-view-index .popup-backdrop.jsx-831600802').remove();

        // bỏ trạng thái active của popup
        $('.popup-wrapper.jsx-831600802').removeClass('active');
    });
})(jQuery);

(function ($) {
    $(function () {
        const $wrap = $('#audio-control-wrapper');
        const $toggle = $wrap.find('.audio-toggle');         // có class mrotate khi quay
        const $iconCancel = $wrap.find('.icon-cancel');      // cần add/remove .jsx-3319532958
        const $iconLine = $wrap.find('.icon-line');          // cần add/remove .jsx-3319532958
        const audio = document.querySelector('audio');

        if (!audio) return;

        function setUI(playing) {
            if (playing) {
                // Đang phát → quay, gỡ highlight nút cancel
                $toggle.addClass('mrotate');
                $iconCancel.removeClass('jsx-3319532958');
                $iconLine.removeClass('jsx-3319532958');
            } else {
                // Tạm dừng → dừng quay, thêm highlight nút cancel
                $toggle.removeClass('mrotate');
                $iconCancel.addClass('jsx-3319532958');
                $iconLine.addClass('jsx-3319532958');
            }
        }

        async function tryAutoplay() {
            try {
                await audio.play();
                setUI(true);
            } catch (e) {
                // Autoplay bị chặn: chờ tương tác đầu tiên
                setUI(false);
                $(document).one('click touchstart', async () => {
                    try {
                        await audio.play();
                        setUI(true);
                    } catch (_) { /* ignore */ }
                });
            }
        }

        // Thử autoplay khi vào trang
        audio.volume = 1.0;
        tryAutoplay();

        // Toggle khi click nút điều khiển
        $wrap.on('click', function (e) {
            e.preventDefault();
            if (audio.paused) {
                audio.play().then(() => setUI(true)).catch(() => {/* có thể vẫn bị chặn nếu chưa có gesture */});
            } else {
                audio.pause();
                setUI(false);
            }
        });
    });
})(jQuery);

// public/js/blessings.js
(function () {
    // ===== helper UI =====
    function closePopup() {
        // gỡ .active của popup
        document.querySelector('#blessing-box-popup.jsx-831600802')?.classList.remove('active');

        // gỡ backdrop (nếu có) + transition nhẹ
        const backdrop = document.querySelector('#app-view-index .popup-backdrop.jsx-831600802') ||
            document.querySelector('.popup-backdrop.jsx-831600802');
        if (backdrop) {
            backdrop.classList.remove('show');
            const removeLater = () => backdrop.remove();
            backdrop.addEventListener('transitionend', removeLater, { once: true });
            setTimeout(removeLater, 300); // fallback
        }

        // gỡ các class có thể làm mờ UI nếu bạn đã dùng trước đó
        document.querySelectorAll('.jsx-3116023621.watermark').forEach(el => el.classList.remove('hide-toolbar-content'));
        const appView = document.querySelector('#app-view-index.jsx-3116023621');
        appView?.classList.remove('hide-toolbar');

        // mở lại scroll body nếu trước đó có khóa
        document.body.style.overflow = '';
    }

    function showToast(message = 'Thành công!') {
        let toast = document.createElement('div');
        toast.className = 'toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);

        // animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        // auto hide
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 1800);
    }

    // ===== phần tạo element lời chúc (giữ nguyên của bạn) =====
    function createBlessingEl(name, message) {
        const wrap = document.createElement('div');
        wrap.className = 'jsx-3895218497 blessing-message';
        wrap.style.opacity = '1';

        const span = document.createElement('span');
        span.className = 'jsx-898919076 blessing-text';

        const strong = document.createElement('strong');
        strong.className = 'jsx-898919076';
        strong.textContent = name;

        span.appendChild(strong);
        span.appendChild(document.createTextNode(`: ${message}`));
        wrap.appendChild(span);
        return wrap;
    }

    async function postJSON(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data.data;
    }

    function disable(el, v) {
        if (!el) return;
        el.disabled = !!v;
        if (v) el.setAttribute('aria-busy', 'true');
        else el.removeAttribute('aria-busy');
    }

    window.addEventListener('DOMContentLoaded', () => {
        const popup = document.getElementById('blessing-box-popup');
        if (!popup) return;

        const nameInput = popup.querySelector('.bar-m-name');
        const msgInput  = popup.querySelector('.bar-m-mess');
        const submitBtn = popup.querySelector('button.cinelove-btn');
        const listBox   = document.getElementById('blessing-box');

        submitBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = (nameInput?.value || '').trim();
            const message = (msgInput?.value || '').trim();
            if (!name || !message) { alert('Vui lòng nhập tên và lời chúc.'); return; }

            disable(submitBtn, true);
            try {
                const saved = await postJSON('/api/blessings', { name, message });

                // chèn vào UI (prepend)
                if (listBox) {
                    const item = createBlessingEl(saved.name, saved.message);
                    const target = listBox.querySelector('.ticker-track') || listBox; // nếu đang dùng ticker
                    target.insertBefore(item, target.firstChild || null);

                    // hiệu ứng nhỏ
                    item.style.opacity = '0';
                    item.style.transition = 'opacity .25s ease, transform .25s ease';
                    item.style.transform = 'translateY(6px)';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                }

                // reset form
                if (nameInput) nameInput.value = '';
                if (msgInput)  msgInput.value = '';

                // đóng popup + gỡ backdrop + thông báo thành công
                closePopup();
                showToast('🎉 Gửi lời chúc thành công!');

                // nếu bạn có ticker và muốn tính lại:
                if (window.rebuildBlessingTicker) {
                    window.rebuildBlessingTicker();
                }
            } catch (err) {
                console.error(err);
                alert('Gửi lời chúc thất bại. Vui lòng thử lại!');
            } finally {
                disable(submitBtn, false);
            }
        });
    });
})();

(function () {
    const btn = document.getElementById('animation-gift-preview-btn');
    const layer = document.getElementById('hearts-layer');

    if (!btn || !layer) return;

    // Tạo 1 trái tim
    function spawnHeart(xvw, durationMs) {
        const el = document.createElement('div');
        el.className = 'heart';
        el.textContent = '❤️'; // có thể thay bằng: el.innerHTML = '<img src=".../heart.png" alt="heart" />';
        // Biến CSS tuỳ biến cho từng tim
        const drift = (Math.random() * 20 - 10).toFixed(1) + 'vw';  // trôi ngang ±10vw
        const rot   = (Math.random() * 720 - 360).toFixed(0) + 'deg';
        const scale = (Math.random() * 0.7 + 0.6).toFixed(2);       // 0.6–1.3
        el.style.left = xvw + 'vw';
        el.style.setProperty('--x', drift);
        el.style.setProperty('--r', rot);
        el.style.setProperty('--s', scale);
        el.style.animationDuration = durationMs + 'ms';

        el.addEventListener('animationend', () => el.remove());
        layer.appendChild(el);
    }

    // Tạo “burst” nhiều trái tim mỗi lần click
    function burstHearts() {
        const count = 14;                                  // số lượng mỗi burst
        const baseDur = 2500;                              // ms
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 100;                   // vị trí ngang 0–100vw
            const jitter = Math.random() * 900 - 450;        // lệch thời lượng ±450ms
            const dur = Math.max(1400, baseDur + jitter);
            setTimeout(() => spawnHeart(x, dur), i * 40);    // rải thời điểm tạo cho tự nhiên
        }
    }

    // Chống spam: throttle 400ms
    let last = 0;
    function throttledBurst() {
        const now = performance.now();
        if (now - last > 400) {
            burstHearts();
            last = now;
        }
    }

    btn.addEventListener('click', throttledBurst);

    // (tuỳ chọn) tự chạy khi hover
    // btn.addEventListener('mouseenter', throttledBurst);
})();