// ===== Model (OOP) =====
class Ruangan {
  constructor(id, nama, gedung, kapasitas, ac) { Object.assign(this, { id, nama, gedung, kapasitas, ac }); }
}
class Jadwal {
  constructor(ruangId, hari, mulai, selesai, ket) { Object.assign(this, { ruangId, hari, mulai, selesai, ket }); }
  bentrok(m, s) { return m < this.selesai && s > this.mulai; }
}
class Peminjaman extends Jadwal {   // inheritance
  constructor(ruangId, tanggal, mulai, selesai, ket, peminjam) {
    super(ruangId, new Date(tanggal + "T00:00").getDay(), mulai, selesai, ket);
    Object.assign(this, { tanggal, peminjam });
  }
}

// ===== Logika =====
const api = (aksi, opt) => fetch("api.php?aksi=" + aksi, opt).then(r => r.json());

class SistemRuang {
  constructor(d) {
    this.ruang = d.ruang.map(r => new Ruangan(+r.id, r.nama, r.gedung, +r.kapasitas, +r.ac === 1));
    this.mingguan = d.mingguan.map(j => new Jadwal(+j.ruangId, +j.hari, j.mulai, j.selesai, j.ket));
    this.pinjam = d.pinjam.map(p => Object.assign(new Peminjaman(+p.ruangId, p.tanggal, p.mulai, p.selesai, p.ket, p.peminjam), { id: +p.id }));
  }
  jadwalHari(ruangId, tanggal) {
    const h = new Date(tanggal + "T00:00").getDay();
    return [...this.mingguan.filter(j => j.ruangId === ruangId && j.hari === h),
            ...this.pinjam.filter(p => p.ruangId === ruangId && p.tanggal === tanggal)]
            .sort((a, b) => a.mulai.localeCompare(b.mulai));
  }
  tersedia(ruangId, tanggal, m, s) { return !this.jadwalHari(ruangId, tanggal).some(j => j.bentrok(m, s)); }
  statusSekarang(r, now) {
    const jam = hm(now), pakai = this.jadwalHari(r.id, tgl(now)).find(j => jam >= j.mulai && jam < j.selesai);
    return pakai ? { ok: false, teks: "Dipakai sampai " + pakai.selesai } : { ok: true, teks: "Kosong" };
  }
  async ajukan(p) {
    if (p.mulai >= p.selesai) return "Jam selesai harus setelah jam mulai.";
    if (!this.tersedia(p.ruangId, p.tanggal, p.mulai, p.selesai)) return "Ruang sudah terpakai di jam itu. Pilih jam lain.";
    try {
      const j = await api("pinjam", { method: "POST", body: JSON.stringify(p) });
      if (j.error) return j.error;
      p.id = j.id; this.pinjam.push(p); return null;
    } catch (e) { return "Server tidak bisa dihubungi. Coba lagi."; }
  }
  async batal(i) {
    try { await api("batal&id=" + this.pinjam[i].id, { method: "POST" }); this.pinjam.splice(i, 1); } catch (e) {}
  }
}

// ===== Tampilan =====
const pad = n => String(n).padStart(2, "0");
const tgl = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const hm = d => pad(d.getHours()) + ":" + pad(d.getMinutes());
const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const app = document.getElementById("app");
const on = (sel, fn) => app.querySelectorAll(sel).forEach(el => el.onclick = () => fn(el));
const acTeks = r => "AC: " + (r.ac ? "Ada" : "Tidak");
let sis, view = "ruang", filter = "semua", buka = null, pesan = null, pilih = null;

function render() {
  document.querySelectorAll(".nav button").forEach(b => b.setAttribute("aria-current", b.dataset.v === view));
  ({ ruang: vRuang, pinjam: vPinjam, riwayat: vRiwayat })[view]();
}

function vRuang() {
  const now = new Date();
  const list = sis.ruang.filter(r => filter === "semua" || sis.statusSekarang(r, now).ok);
  app.innerHTML = `<h1>Ruang kelas hari ini</h1>
    <p class="sub">${hari[now.getDay()]}, ${tgl(now)} · pukul ${hm(now)}</p>
    <div class="chips">
      <button class="chip" data-f="semua" aria-pressed="${filter === "semua"}">Semua ruang</button>
      <button class="chip" data-f="kosong" aria-pressed="${filter === "kosong"}">Kosong sekarang</button>
    </div>
    ${list.length ? "" : `<p class="empty">Semua ruang sedang dipakai. Coba lagi nanti.</p>`}
    ${list.map(r => {
      const s = sis.statusSekarang(r, now), j = sis.jadwalHari(r.id, tgl(now));
      return `<div class="room">
        <button data-r="${r.id}"><div class="grow"><div class="name">${r.nama}</div>
          <div class="meta">${r.gedung} · ${r.kapasitas} kursi · ${acTeks(r)}</div></div>
          <span class="badge ${s.ok ? "ok" : "no"}">${s.teks}</span></button>
        ${buka === r.id ? `<div class="det"><strong>Jadwal hari ini</strong>
          ${j.length ? j.map(x => `<div><span>${x.mulai}–${x.selesai}</span><span>${x.ket}</span></div>`).join("") : "<div>Belum ada jadwal.</div>"}
          <button class="btn" data-p="${r.id}">Ajukan izin pinjam</button></div>` : ""}
      </div>`;
    }).join("")}`;
  on("[data-f]", b => { filter = b.dataset.f; render(); });
  on("[data-r]", b => { const id = +b.dataset.r; buka = buka === id ? null : id; render(); });
  on("[data-p]", b => { pilih = +b.dataset.p; pesan = null; view = "pinjam"; render(); });
}

function vPinjam() {
  const now = new Date();
  app.innerHTML = `<h1>Pinjam ruang</h1><p class="sub">Sistem mengecek bentrok jadwal otomatis.</p>
    <label for="r">Ruang</label>
    <select id="r">${sis.ruang.map(r => `<option value="${r.id}" ${r.id === pilih ? "selected" : ""}>${r.nama} (${r.kapasitas} kursi, ${acTeks(r)})</option>`).join("")}</select>
    <label for="t">Tanggal</label><input id="t" type="date" value="${tgl(now)}" min="${tgl(now)}">
    <div class="row2">
      <div><label for="m">Mulai</label><input id="m" type="time" value="13:00"></div>
      <div><label for="s">Selesai</label><input id="s" type="time" value="15:00"></div>
    </div>
    <label for="k">Keperluan</label><input id="k" placeholder="Contoh: Diskusi kelompok PBO">
    <label for="n">Nama peminjam</label><input id="n" placeholder="Nama atau NIM">
    <button class="btn" id="go">Ajukan izin pinjam</button>
    ${pesan ? `<div class="msg ${pesan.ok ? "ok" : "no"}">${pesan.t}</div>` : ""}`;
  document.getElementById("go").onclick = async () => {
    const v = id => document.getElementById(id).value.trim();
    if (!v("k") || !v("n") || !v("t")) { pesan = { ok: false, t: "Lengkapi tanggal, keperluan, dan nama." }; return vPinjam(); }
    const err = await sis.ajukan(new Peminjaman(+v("r"), v("t"), v("m"), v("s"), v("k"), v("n")));
    pesan = err ? { ok: false, t: err } : { ok: true, t: "Berhasil dipinjam. Lihat di tab Riwayat." };
    pilih = +v("r"); vPinjam();
  };
}

function vRiwayat() {
  app.innerHTML = `<h1>Riwayat peminjaman</h1><p class="sub">Tersimpan di server.</p>
    ${sis.pinjam.length ? "" : `<p class="empty">Belum ada peminjaman. Buka tab Pinjam untuk memesan ruang.</p>`}
    ${sis.pinjam.map((p, i) => `<div class="room"><div class="det" style="border:0">
      <div><strong>${sis.ruang.find(x => x.id === p.ruangId).nama}</strong><span>${p.tanggal}</span></div>
      <div><span>${p.mulai}–${p.selesai}</span><span>${p.ket}</span></div>
      <div><span>${p.peminjam}</span></div>
      <button class="btn sec" data-b="${i}">Batalkan</button></div></div>`).join("")}`;
  on("[data-b]", async b => { await sis.batal(+b.dataset.b); render(); });
}

document.querySelectorAll(".nav button").forEach(b => b.onclick = () => { view = b.dataset.v; pesan = null; render(); });
app.textContent = "Memuat data…";
api("data").then(d => { sis = new SistemRuang(d); render(); })
  .catch(() => { app.textContent = "Data tidak bisa dimuat. Pastikan Apache dan MySQL aktif."; });
  