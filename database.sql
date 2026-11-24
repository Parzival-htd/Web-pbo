CREATE DATABASE IF NOT EXISTS ruang_kelas CHARACTER SET utf8mb4;
USE ruang_kelas;
CREATE TABLE ruangan (id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(50) NOT NULL, gedung VARCHAR(50) NOT NULL, kapasitas INT NOT NULL, ac TINYINT(1) NOT NULL DEFAULT 0);
CREATE TABLE jadwal (id INT AUTO_INCREMENT PRIMARY KEY, ruangan_id INT NOT NULL, hari TINYINT NOT NULL COMMENT '0=Minggu..6=Sabtu', mulai TIME NOT NULL, selesai TIME NOT NULL, ket VARCHAR(100) NOT NULL, FOREIGN KEY (ruangan_id) REFERENCES ruangan(id));
CREATE TABLE peminjaman (id INT AUTO_INCREMENT PRIMARY KEY, ruangan_id INT NOT NULL, tanggal DATE NOT NULL, mulai TIME NOT NULL, selesai TIME NOT NULL, ket VARCHAR(100) NOT NULL, peminjam VARCHAR(80) NOT NULL, FOREIGN KEY (ruangan_id) REFERENCES ruangan(id));
INSERT INTO ruangan (nama,gedung,kapasitas,ac) VALUES ('A-101','Gedung A',40,1),('A-102','Gedung A',30,0),('B-201','Gedung B',60,1),('Lab Komputer 1','Gedung C',35,1);
INSERT INTO jadwal (ruangan_id,hari,mulai,selesai,ket) VALUES (1,1,'08:00','10:00','Algoritma'),(1,1,'13:00','15:00','Basis Data'),(2,1,'09:00','11:00','Statistika'),(3,2,'10:00','12:00','Pemrograman Web'),(4,2,'08:00','11:00','Praktikum PBO'),(4,3,'13:00','16:00','Praktikum Web'),(1,4,'10:00','12:00','Jaringan'),(3,5,'08:00','10:00','Kewirausahaan');
