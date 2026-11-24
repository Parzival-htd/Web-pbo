<?php
class SistemRuang {
    public function __construct(private PDO $db) {}

    public function semua(): array {
        $jam = "TIME_FORMAT(mulai,'%H:%i') AS mulai, TIME_FORMAT(selesai,'%H:%i') AS selesai";
        return [
            'ruang'    => $this->db->query('SELECT id,nama,gedung,kapasitas,ac FROM ruangan')->fetchAll(),
            'mingguan' => $this->db->query("SELECT ruangan_id AS ruangId,hari,$jam,ket FROM jadwal")->fetchAll(),
            'pinjam'   => $this->db->query("SELECT id,ruangan_id AS ruangId,DATE_FORMAT(tanggal,'%Y-%m-%d') AS tanggal,$jam,ket,peminjam FROM peminjaman WHERE tanggal >= CURDATE()")->fetchAll(),
        ];
    }

    public function tersedia(Peminjaman $p): bool {
        $a = $this->db->prepare('SELECT COUNT(*) FROM jadwal WHERE ruangan_id=? AND hari=? AND mulai < ? AND selesai > ?');
        $a->execute([$p->getRuangId(), (int) date('w', strtotime($p->getTanggal())), $p->getSelesai(), $p->getMulai()]);
        $b = $this->db->prepare('SELECT COUNT(*) FROM peminjaman WHERE ruangan_id=? AND tanggal=? AND mulai < ? AND selesai > ?');
        $b->execute([$p->getRuangId(), $p->getTanggal(), $p->getSelesai(), $p->getMulai()]);
        return $a->fetchColumn() == 0 && $b->fetchColumn() == 0;
    }

    public function ajukan(Peminjaman $p): array {
        if ($err = $p->valid()) return ['error' => $err, 'id' => null];
        if (!$this->tersedia($p)) return ['error' => 'Ruang sudah terpakai di jam itu. Pilih jam lain.', 'id' => null];
        $q = $this->db->prepare('INSERT INTO peminjaman (ruangan_id,tanggal,mulai,selesai,ket,peminjam) VALUES (?,?,?,?,?,?)');
        $q->execute([$p->getRuangId(), $p->getTanggal(), $p->getMulai(), $p->getSelesai(), $p->getKet(), $p->getPeminjam()]);
        return ['error' => null, 'id' => (int) $this->db->lastInsertId()];
    }

    public function batal(int $id): void {
        $this->db->prepare('DELETE FROM peminjaman WHERE id=?')->execute([$id]);
    }
}
