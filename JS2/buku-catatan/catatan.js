const fs = require('fs');
const chalk = require('chalk');

const ambilCatatan = function() {
    return 'Ini catatan Dafin Surya';
}

// Fungsi untuk menampilkan daftar semua catatan dari catatan.json
const listCatatan = function() {
    const catatan = muatCatatan();
    if (catatan.length === 0) {
        console.log('Tidak ada catatan.');
    } else {
        console.log('Daftar catatan:');
        catatan.forEach((note, idx) => {
            console.log(`${idx + 1}. ${note.title} : ${note.body}`);
        });
    }
}

// Fungsi untuk membaca sebuah catatan berdasarkan judul dari catatan.json
const bacaCatatan = function(judul) {
    const catatan = muatCatatan();
    const note = catatan.find(note => note.title === judul);
    if (note) {
        console.log('Catatan ditemukan:');
        console.log('Judul: ' + note.title);
        console.log('Isi: ' + note.body);
    } else {
        console.log('Catatan dengan judul tersebut tidak ditemukan.');
    }
}

// Fungsi untuk menambah catatan baru
const tambahCatatan = function(judul, isi) {
    const catatan = muatCatatan();
    const catatanGanda = catatan.filter(function(note) {
        return note.title === judul;
    })
    if(catatanGanda.length === 0) {
        catatan.push({
            title: judul,
            body: isi
        })
        simpanCatatan(catatan);
        console.log('Catatan berhasil ditambahkan!');
    } else {
        console.log('Judul catatan sudah ada, gunakan judul lain!');
    }
}

const simpanCatatan = function(catatan) {
    const dataJSON = JSON.stringify(catatan);
    fs.writeFileSync('catatan.json', dataJSON);
}

const muatCatatan = function() {
    try {
        const dataBuffer = fs.readFileSync('catatan.json');
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (e) {
        return [];
    }
}

const hapusCatatan = function(judul) {
    const catatan = muatCatatan();
    const catatanUntukDisimpan = catatan.filter(function(note) {
        return note.title !== judul;
    })
    if(catatan.length > catatanUntukDisimpan.length) {
        console.log(chalk.green.inverse('Catatan dihapus!'));
        simpanCatatan(catatanUntukDisimpan);
    } else {
        console.log(chalk.red.inverse('Catatan tidak ditemukan!'));
    }
}

module.exports = {
    ambilCatatan: ambilCatatan,
    listCatatan: listCatatan,
    bacaCatatan: bacaCatatan,
    tambahCatatan: tambahCatatan,
    hapusCatatan: hapusCatatan,
};