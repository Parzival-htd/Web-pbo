<?php
class Jadwal {
    public function __construct(
        protected int $ruangId, protected int $hari,
        protected string $mulai, protected string $selesai, protected string $ket
    ) {}
    public function getRuangId(): int { return $this->ruangId; }
    public function getMulai(): string { return $this->mulai; }
    public function getSelesai(): string { return $this->selesai; }
    public function getKet(): string { return $this->ket; }
    public function bentrok(string $m, string $s): bool { return $m < $this->selesai && $s > $this->mulai; }
}
