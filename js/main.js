/* ==========================================================
   AHMAD ALI RAJPOOT — PORTFOLIO V2 — main.js
   ========================================================== */
(() => {
  "use strict";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasHover = window.matchMedia("(hover: hover)").matches;

  /* ---------------- custom cursor ---------------- */
  if (!reduceMotion && hasHover) {
    const cur = document.getElementById("cursor");
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .bubble, .workcard, #scene").forEach((el) => {
      el.addEventListener("mouseenter", () => cur.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cur.classList.remove("is-big"));
    });
  }

  /* ---------------- smooth in-page anchor scroll (URL-preserving) ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      // let ctrl/cmd/shift/middle-click do their normal thing (new tab, etc)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", `#${id}`);
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
  // land on the right section if the page was opened with a hash already
  if (location.hash) {
    const initial = document.getElementById(location.hash.slice(1));
    if (initial) requestAnimationFrame(() => initial.scrollIntoView({ behavior: "auto", block: "start" }));
  }

  /* ---------------- nav burger ---------------- */
  const burger = document.getElementById("navBurger");
  const navPill = document.getElementById("navPill");
  burger?.addEventListener("click", () => navPill.classList.toggle("is-open"));
  navPill?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navPill.classList.remove("is-open")));

  /* ---------------- discord: click to copy username ---------------- */
  const discordBtn = document.getElementById("discordCopy");
  if (discordBtn) {
    const label = discordBtn.querySelector(".discord-label");
    const original = label.textContent;
    const username = discordBtn.dataset.discord;
    discordBtn.addEventListener("click", () => {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 700));
      const copy = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(username)
        : Promise.reject(new Error("no clipboard API"));
      Promise.race([copy, timeout])
        .then(() => { label.textContent = "Copied!"; })
        .catch(() => { label.textContent = username; })
        .finally(() => { setTimeout(() => { label.textContent = original; }, 1800); });
    });
  }

  /* ---------------- hero reveal ---------------- */
  requestAnimationFrame(() => {
    setTimeout(() => document.querySelector(".hero__copy")?.classList.add("is-ready"), 150);
  });

  /* ---------------- magnetic buttons ---------------- */
  if (!reduceMotion && hasHover) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------- marquee ---------------- */
  const items = [
    "SOC L1 Experience", "Cortex XDR", "Burp Suite", "Metasploit", "Python", "Flask",
    "AI Agents", "Automation", "Penetration Testing", "IDA Pro", "Ghidra",
    "Incident Response", "Kali Linux", "COMSATS University Islamabad",
  ];
  const mTrack = document.getElementById("marqueeTrack");
  if (mTrack) {
    const html = items.map((t, i) => `<span>${t}</span><span class="accent">${i % 2 ? "◆" : "✦"}</span>`).join("");
    mTrack.innerHTML = html + html;
  }

  /* ---------------- fade-up reveals ---------------- */
  document.querySelectorAll(
    ".about__copy, .about__photo, .journey__item, .fact, .tag-label, .split-title, .contact .wrap > *"
  ).forEach((el) => el.classList.add("fade-up"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (i % 5) * 60 + "ms";
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".fade-up").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".fade-up").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- stat counters ---------------- */
  document.querySelectorAll(".stat-pill b, .stat__num").forEach((el) => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1000, start = performance.now();
        function step(now) {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------------- skill bubbles: layout + cursor-repel + drag ---------------- */
  (function bubbles() {
    const field = document.getElementById("bubbleField");
    if (!field) return;
    const skills = [
      { t: "Vulnerability Assessment", c: "security" }, { t: "Penetration Testing", c: "security" },
      { t: "Incident Response", c: "security" }, { t: "SOC Alert Triage", c: "security" },
      { t: "Network Security", c: "security" }, { t: "Cortex XDR", c: "security" },
      { t: "Burp Suite", c: "security" }, { t: "Metasploit", c: "security" },
      { t: "Nmap", c: "security" }, { t: "Wireshark", c: "security" },
      { t: "IDA Pro / Ghidra", c: "security" }, { t: "Kali Linux", c: "security" },
      { t: "Full-Stack Dev", c: "dev" }, { t: "Python", c: "dev" }, { t: "Flask", c: "dev" },
      { t: "JavaScript", c: "dev" }, { t: "Socket.IO", c: "dev" }, { t: "C / C++", c: "dev" },
      { t: "AI Agents", c: "ai" }, { t: "Workflow Automation", c: "ai" }, { t: "AI-Assisted Dev", c: "ai" },
      { t: "Approval-Gated Pipelines", c: "ai" },
    ];

    const items2 = skills.map((s) => {
      const el = document.createElement("div");
      el.className = `bubble cat-${s.c}`;
      el.innerHTML = `<span class="bubble__dot"></span>${s.t}`;
      field.appendChild(el);
      return { el, s };
    });

    function layout() {
      const W = field.clientWidth;
      const cols = W < 460 ? 1 : W < 700 ? 2 : 4;
      const rowH = cols === 1 ? 60 : 78;
      items2.forEach((it, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const jitterX = cols === 1 ? 0 : (Math.random() - 0.5) * 30;
        const jitterY = cols === 1 ? 0 : (Math.random() - 0.5) * 24;
        const colW = W / cols;
        const bubbleW = it.el.offsetWidth || 140;
        // clamp so the bubble's actual rendered width never overflows its column
        const maxX = Math.max(0, colW - bubbleW - 8);
        const x = Math.min(colW * col + colW * 0.16 + jitterX, colW * col + maxX);
        const y = row * rowH + 20 + jitterY;
        it.x = it.baseX = Math.max(colW * col + 4, x);
        it.y = it.baseY = y;
        it.vx = 0; it.vy = 0;
        it.el.style.left = "0px";
        it.el.style.top = "0px";
      });
      // the field's height must fit however many rows this column count needs,
      // or bubbles spill into whatever section comes next
      const rows = Math.ceil(items2.length / cols);
      field.style.height = (rows * rowH + 50) + "px";
    }
    layout();
    window.addEventListener("resize", layout);

    let mouseX = -9999, mouseY = -9999;
    field.addEventListener("mousemove", (e) => {
      const r = field.getBoundingClientRect();
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    });
    field.addEventListener("mouseleave", () => { mouseX = -9999; mouseY = -9999; });

    // drag support
    let dragging = null;
    items2.forEach((it) => {
      it.el.addEventListener("pointerdown", (e) => {
        dragging = it;
        it.el.setPointerCapture(e.pointerId);
      });
      it.el.addEventListener("pointermove", (e) => {
        if (dragging !== it) return;
        const r = field.getBoundingClientRect();
        it.x = e.clientX - r.left - it.el.offsetWidth / 2;
        it.y = e.clientY - r.top - it.el.offsetHeight / 2;
        it.vx = 0; it.vy = 0;
      });
      it.el.addEventListener("pointerup", () => { dragging = null; });
    });

    if (!reduceMotion) {
      function tick() {
        items2.forEach((it) => {
          if (dragging === it) {
            it.el.style.transform = `translate(${it.x}px, ${it.y}px)`;
            return;
          }
          // spring back to base
          it.vx += (it.baseX - it.x) * 0.006;
          it.vy += (it.baseY - it.y) * 0.006;
          // repel from cursor
          const dx = it.x + 50 - mouseX, dy = it.y + 16 - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const force = (110 - dist) / 110;
            it.vx += (dx / (dist || 1)) * force * 3.2;
            it.vy += (dy / (dist || 1)) * force * 3.2;
          }
          it.vx *= 0.88; it.vy *= 0.88;
          it.x += it.vx; it.y += it.vy;
          it.el.style.transform = `translate(${it.x}px, ${it.y}px)`;
        });
        requestAnimationFrame(tick);
      }
      tick();
    } else {
      items2.forEach((it) => { it.el.style.transform = `translate(${it.baseX}px, ${it.baseY}px)`; });
    }
  })();

  /* ---------------- work carousel drag ---------------- */
  (function carousel() {
    const wrap = document.getElementById("carousel");
    const track = document.getElementById("carouselTrack");
    if (!wrap || !track) return;
    // calling setPointerCapture on every pointerdown (even a plain tap on a
    // link) makes Chromium retarget the resulting click to the capturing
    // element, silently swallowing clicks on the project links. Only start
    // capturing once the pointer has actually moved past a small threshold,
    // so a stationary click/tap reaches its target normally.
    const DRAG_THRESHOLD = 6;
    let pointerId = null, isDown = false, dragging = false, startX = 0, scrollStart = 0;
    wrap.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isDown = true;
      dragging = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      scrollStart = wrap.scrollLeft;
    });
    wrap.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        wrap.classList.add("is-dragging");
        wrap.setPointerCapture(pointerId);
      }
      wrap.scrollLeft = scrollStart - dx;
    });
    function endDrag() {
      if (dragging) {
        // a real drag happened: swallow the one click that would otherwise
        // fire on whatever ended up under the pointer at release
        const suppressClick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          wrap.removeEventListener("click", suppressClick, true);
        };
        wrap.addEventListener("click", suppressClick, true);
      }
      isDown = false;
      dragging = false;
      wrap.classList.remove("is-dragging");
    }
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => wrap.addEventListener(ev, endDrag));
    // Deliberately no wheel/deltaY handling here: vertical scroll (mouse
    // wheel or trackpad) must pass through untouched to scroll the page.
    // Horizontal movement only comes from pointer-drag above, or native
    // horizontal scroll (trackpad two-finger sideways swipe, shift+wheel),
    // which the browser already handles via overflow-x on .carousel.
  })();

  /* ==========================================================
     3D HERO SCENE — drag-to-orbit low-poly "workshop island"
     ========================================================== */
  function buildHeroScene() {
    const canvas = document.getElementById("scene");
    if (!canvas || typeof THREE === "undefined") return;

    const isNarrow = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isNarrow, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isNarrow ? 1.5 : 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

    const rig = new THREE.Group(); // rotates for orbit control
    scene.add(rig);
    const island = new THREE.Group();
    rig.add(island);

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x40405a, 1.1));
    const key = new THREE.DirectionalLight(0x8ef7c8, 1.4);
    key.position.set(4, 6, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0xff7a6e, 2.2, 20);
    rim.position.set(-4, 2, -3);
    scene.add(rim);
    const fill = new THREE.PointLight(0x8b7cf6, 1.4, 18);
    fill.position.set(3, -1, -4);
    scene.add(fill);

    const flat = true;

    // ---- glow ring under island ----
    const ringGeo = new THREE.RingGeometry(2.6, 3.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x5ef2b0, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.55;
    island.add(ring);

    // ---- island base (rounded platform) ----
    const baseGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.7, 8, 1);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1c1d33, flatShading: flat, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1.3;
    base.rotation.y = Math.PI / 8;
    island.add(base);
    const topGeo = new THREE.CylinderGeometry(2.28, 2.3, 0.25, 8, 1);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x232447, flatShading: flat, roughness: 0.8 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = -0.95;
    top.rotation.y = Math.PI / 8;
    island.add(top);

    function addHotspotLabel() {} // placeholder (labels handled via DOM overlay optionally)

    // ---- desk (About) ----
    const deskGroup = new THREE.Group();
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x3a2f6b, flatShading: flat })
    );
    deskTop.position.y = 0;
    deskGroup.add(deskTop);
    [[-0.65,-0.35,-0.3],[0.65,-0.35,-0.3],[-0.65,-0.35,0.3],[0.65,-0.35,0.3]].forEach(([x,y,z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.5,0.08), new THREE.MeshStandardMaterial({ color: 0x232447, flatShading: flat }));
      leg.position.set(x, y, z);
      deskGroup.add(leg);
    });
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x101020, flatShading: flat })
    );
    monitor.position.set(0, 0.35, -0.15);
    deskGroup.add(monitor);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x5ef2b0 })
    );
    screen.position.set(0, 0.35, -0.115);
    deskGroup.add(screen);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.15,0.08), new THREE.MeshStandardMaterial({ color: 0x101020, flatShading: flat }));
    stand.position.set(0, 0.05, -0.15);
    deskGroup.add(stand);
    deskGroup.position.set(-1.15, -0.55, 0.5);
    deskGroup.rotation.y = 0.4;
    deskGroup.userData.hotspot = "about";
    island.add(deskGroup);

    // ---- shield (Skills) ----
    const shieldGroup = new THREE.Group();
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0xff7a6e, flatShading: flat, roughness: 0.5 });
    const shieldBody = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 4), shieldMat);
    shieldBody.rotation.x = Math.PI;
    const shieldTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 4), shieldMat);
    shieldTop.position.y = 0.34;
    shieldGroup.add(shieldBody, shieldTop);
    shieldGroup.rotation.z = Math.PI / 4;
    shieldGroup.position.set(0.9, 0.15, -0.7);
    shieldGroup.userData.hotspot = "skills";
    shieldGroup.userData.floatSeed = 0;
    island.add(shieldGroup);

    // ---- server stack (Work) ----
    const serverGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.16, 0.4),
        new THREE.MeshStandardMaterial({ color: i === 1 ? 0x8b7cf6 : 0x232447, flatShading: flat })
      );
      box.position.y = i * 0.2;
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color: 0x5ef2b0 }));
      led.position.set(0.2, i * 0.2, 0.21);
      serverGroup.add(box, led);
    }
    serverGroup.position.set(0.9, -0.55, 0.8);
    serverGroup.userData.hotspot = "work";
    island.add(serverGroup);

    // ---- beacon (Contact) ----
    const beaconGroup = new THREE.Group();
    const beaconPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.6,6), new THREE.MeshStandardMaterial({ color: 0x232447, flatShading: flat }));
    beaconPole.position.y = 0.3;
    const beaconOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), new THREE.MeshStandardMaterial({ color: 0x5ef2b0, emissive: 0x2a6b4e, flatShading: flat }));
    beaconOrb.position.y = 0.66;
    beaconGroup.add(beaconPole, beaconOrb);
    beaconGroup.position.set(-1.1, -0.55, -0.7);
    beaconGroup.userData.hotspot = "contact";
    beaconGroup.userData.orb = beaconOrb;
    island.add(beaconGroup);

    // ---- little tree accents ----
    [[1.6,-0.4,0.1],[-1.7,-0.35,0.6]].forEach(([x,y,z]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,0.3,5), new THREE.MeshStandardMaterial({ color: 0x2a2440, flatShading: flat }));
      trunk.position.set(x, y+0.15, z);
      const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color: 0x8b7cf6, flatShading: flat }));
      foliage.position.set(x, y+0.4, z);
      island.add(trunk, foliage);
    });

    // ---- companion orb (mascot, orbits the island) ----
    const companion = new THREE.Group();
    const cBody = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: 0xf5f3ff, flatShading: false, roughness: 0.3 }));
    const cRingGeo = new THREE.TorusGeometry(0.24, 0.02, 8, 24);
    const cRing = new THREE.Mesh(cRingGeo, new THREE.MeshBasicMaterial({ color: 0x5ef2b0 }));
    cRing.rotation.x = Math.PI / 2.4;
    companion.add(cBody, cRing);
    rig.add(companion);

    // ---- starfield ----
    const starCount = 240;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 14 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i*3+1] = r * Math.cos(phi) * 0.6;
      starPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ---- camera placement ----
    island.position.y = -0.9;
    camera.position.set(0, 2.6, 8.2);
    camera.lookAt(0, -1.1, 0);

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // on a narrow/square canvas (mobile: the scene is its own block, not
      // a full-bleed backdrop) pull back so the whole island still fits
      if (camera.aspect < 1.15) {
        camera.position.set(0, 3.4, 11.5);
        camera.lookAt(0, -1.1, 0);
      } else {
        camera.position.set(0, 2.6, 8.2);
        camera.lookAt(0, -1.1, 0);
      }
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // ---- drag to orbit ----
    let restRotY = 0.5, restRotX = -0.08;
    let targetRotY = restRotY, targetRotX = restRotX;
    let curRotY = targetRotY, curRotX = targetRotX;
    let dragging = false, lastX = 0, lastY = 0;
    let idleTimer = 0;
    const hint = document.getElementById("dragHint");

    function pointerDown(x, y) {
      dragging = true; lastX = x; lastY = y; idleTimer = 0;
      hint?.style.setProperty("opacity", "0");
    }
    function pointerMove(x, y) {
      if (!dragging) return;
      restRotY += (x - lastX) * 0.006;
      restRotX += (y - lastY) * 0.004;
      restRotX = Math.max(-0.5, Math.min(0.5, restRotX));
      targetRotY = restRotY; targetRotX = restRotX;
      lastX = x; lastY = y;
    }
    function pointerUp() { dragging = false; }

    canvas.addEventListener("pointerdown", (e) => pointerDown(e.clientX, e.clientY));
    window.addEventListener("pointermove", (e) => pointerMove(e.clientX, e.clientY));
    window.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("touchstart", (e) => { const t = e.touches[0]; pointerDown(t.clientX, t.clientY); }, { passive: true });
    canvas.addEventListener("touchmove", (e) => { const t = e.touches[0]; pointerMove(t.clientX, t.clientY); }, { passive: true });
    canvas.addEventListener("touchend", pointerUp);

    // ---- click hotspot detection ----
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0, downY = 0;
    canvas.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; });
    canvas.addEventListener("pointerup", (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // was a drag
      const r = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(island.children, true);
      for (const h of hits) {
        let obj = h.object;
        while (obj && !obj.userData.hotspot) obj = obj.parent;
        if (obj && obj.userData.hotspot) {
          const target = document.getElementById(obj.userData.hotspot);
          target?.scrollIntoView({ behavior: "smooth" });
          break;
        }
      }
    });

    const clock = new THREE.Clock();
    let rafId = null;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (!dragging) {
        idleTimer += dt;
        if (idleTimer > 2.5) targetRotY = restRotY + Math.sin(t * 0.22) * 0.32; // gentle sway when idle
      }
      curRotY += (targetRotY - curRotY) * 0.08;
      curRotX += (targetRotX - curRotX) * 0.08;
      rig.rotation.y = curRotY;
      rig.rotation.x = curRotX;

      island.position.y = -0.9 + Math.sin(t * 0.6) * 0.08;
      shieldGroup.position.y = 0.15 + Math.sin(t * 1.3) * 0.06;
      shieldGroup.rotation.y += dt * 0.6;
      beaconGroup.userData.orb.rotation.y += dt * 1.2;
      beaconGroup.userData.orb.position.y = 0.66 + Math.sin(t * 1.8) * 0.03;
      ring.rotation.z += dt * 0.05;

      companion.position.set(Math.cos(t * 0.35) * 2.9, 0.6 + Math.sin(t * 1.1) * 0.25, Math.sin(t * 0.35) * 2.9);
      cRing.rotation.z += dt * 0.8;

      renderer.render(scene, camera);
    }
    // only render while the scene is actually on screen — two permanently
    // live WebGL contexts (this one + the contact-section orb) is what was
    // crashing mobile Safari's GPU process after a while
    function startLoop() { if (rafId === null) animate(); }
    function stopLoop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }
    startLoop();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? startLoop() : stopLoop()));
      }, { threshold: 0 }).observe(canvas);
    }
  }

  function buildOrbScene() {
    const canvas = document.getElementById("orbCanvas");
    if (!canvas || typeof THREE === "undefined") return;
    const isNarrow = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isNarrow, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isNarrow ? 1.5 : 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 6);
    scene.add(new THREE.AmbientLight(0x40405a, 1));
    const l1 = new THREE.PointLight(0x5ef2b0, 2, 12); l1.position.set(3,2,3); scene.add(l1);
    const l2 = new THREE.PointLight(0xff7a6e, 1.5, 12); l2.position.set(-3,-2,2); scene.add(l2);
    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 1),
      new THREE.MeshStandardMaterial({ color: 0x191a2c, flatShading: true, roughness: 0.4, metalness: 0.2 })
    );
    scene.add(orb);
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshBasicMaterial({ color: 0x5ef2b0, wireframe: true, transparent: true, opacity: 0.25 })
    );
    scene.add(wire);
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);
    const clock = new THREE.Clock();
    let rafId = null;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      orb.rotation.y += dt * 0.15;
      orb.rotation.x += dt * 0.05;
      wire.rotation.y -= dt * 0.1;
      renderer.render(scene, camera);
    }
    // this canvas sits at the bottom of the page — don't burn a live WebGL
    // context rendering it before the user ever scrolls there
    function startLoop() { if (rafId === null) animate(); }
    function stopLoop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? startLoop() : stopLoop()));
      }, { threshold: 0 }).observe(canvas);
    } else {
      startLoop();
    }
  }

  if (!reduceMotion) {
    buildHeroScene();
    buildOrbScene();
  }
})();
