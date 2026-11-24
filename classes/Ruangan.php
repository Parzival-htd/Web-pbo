<?php
class Ruangan {
    public function __construct(
        private int $id, private string $nama, private string $gedung,
        private int $kapasitas, private bool $ac
    ) {}
    public function getId(): int { return $this->id; }
    public function getNama(): string { return $this->nama; }
    public function getKapasitas(): int { return $this->kapasitas; }
}
