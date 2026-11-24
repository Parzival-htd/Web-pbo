<?php
// Inheritance: Peminjaman adalah Jadwal yang punya tanggal dan peminjam
class Peminjaman extends Jadwal {
    public function __construct(int $ruangId, private string $tanggal, string $mulai, string $selesai, string $ket, private string $peminjam) {
        parent::__construct($ruangId, (int) date('w', strtotime($tanggal)), $mulai, $selesai, $ket);
    }
    public function getTanggal(): string { return $this->tanggal; }
    public function getPeminjam(): string { return $this->peminjam; }
    public function valid(): ?string {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $this->tanggal) || !strtotime($this->tanggal)) return 'Tanggal tidak valid.';
        if (!preg_match('/^\d{2}:\d{2}$/', $this->mulai) || !preg_match('/^\d{2}:\d{2}$/', $this->selesai)) return 'Format jam tidak valid.';
        if ($this->mulai >= $this->selesai) return 'Jam selesai harus setelah jam mulai.';
        if ($this->ket === '' || $this->peminjam === '') return 'Keperluan dan nama wajib diisi.';
        return null;
    }
}
