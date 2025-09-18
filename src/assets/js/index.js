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
        $track.append($items).append($original);

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