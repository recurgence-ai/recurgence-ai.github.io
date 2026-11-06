(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  // 页眉：滚动后变实底
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // 移动端菜单
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = !mobileNav.classList.contains("open");
      mobileNav.classList.toggle("open", open);
      header.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  // 进场动画
  const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));

    // 演示视频：进入视口才播放，省流量
    const vio = new IntersectionObserver((entries) =>
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
      }), { threshold: 0.25 });
    document.querySelectorAll("video[data-autoplay]").forEach((v) => vio.observe(v));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // 生态滚动条：复制一份轨道内容实现无缝循环
  // 走马灯：先把条目铺满一屏宽，再整体复制一份，translateX(-50%) 正好无缝衔接；速度按宽度统一
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".marquee-track").forEach((track) => {
    if (still) return;
    const items = [...track.children];
    const clone = (c) => { const n = c.cloneNode(true); n.setAttribute("aria-hidden", "true"); return n; };
    const need = Math.max(track.parentElement.clientWidth, window.screen ? screen.width : 0);
    for (let i = 0; track.scrollWidth < need && i < 12; i++) items.forEach((c) => track.appendChild(clone(c)));
    const half = track.scrollWidth;
    [...track.children].forEach((c) => track.appendChild(clone(c)));
    track.style.animationDuration = Math.round(half / 38) + "s";
  });

  // 草稿模式开关（只影响本机预览；上线前删除 body 上的 draft / has-draft 类）
  const btn = document.querySelector(".draft-toggle");
  if (btn && document.body.classList.contains("has-draft")) {
    let on = true;
    try { on = localStorage.getItem("xy-draft") !== "off"; } catch (_) {}
    const apply = () => {
      document.body.classList.toggle("draft", on);
      btn.textContent = on ? "隐藏待补标记" : "显示待补标记";
    };
    apply();
    btn.addEventListener("click", () => {
      on = !on;
      try { localStorage.setItem("xy-draft", on ? "on" : "off"); } catch (_) {}
      apply();
    });
  }

  // 联系表单：后端未接入前，先生成邮件草稿
  const form = document.querySelector("form[data-contact]");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const status = form.querySelector(".form-status");
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const interests = data.getAll("interest").join("、") || "未选择";
      const lines = [
        `姓名：${data.get("name")}`,
        `单位：${data.get("org")}`,
        `职务：${data.get("title") || "-"}`,
        `手机：${data.get("phone")}`,
        `邮箱：${data.get("email") || "-"}`,
        `客户类型：${data.get("segment")}`,
        `感兴趣的产品：${interests}`,
        "",
        `${data.get("message") || ""}`,
      ];
      const to = form.dataset.mailto;
      if (to) {
        location.href = `mailto:${to}?subject=${encodeURIComponent("预约演示 · " + data.get("org"))}&body=${encodeURIComponent(lines.join("\n"))}`;
        status.textContent = "已为你打开邮件草稿，发送后我们会尽快与你联系。";
      } else {
        status.textContent = "表单后端尚未接入（草稿站）。已在控制台输出提交内容。";
        console.log("[contact-form]", lines.join("\n"));
      }
    });
  }

  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
