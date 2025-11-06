const fs = require('fs')
// fs.writeFileSync('catatan.txt', 'Nama Saya Dafin Surya')
// fs.appendFileSync('catatan.txt', ' Saya tinggal di Padang')

/*
const catatan = require('./catatan.js')
const pesan = catatan()
console.log(pesan)
*/

const validator = require('validator')

// pastikan memasang chalk versi 4.x (require style)
const chalk = require('chalk')
const catatan = require('./catatan.js')

/*
console.log(pesan)
console.log(validator.isURL('https://dafin.com'))

// Cetak teks sesuai tugas menggunakan chalk
console.log(chalk.blue('print warna biru sukses'))

// Contoh variasi warna/format lain
console.log(chalk.green.bold('Sukses: operasi berhasil'))
//console.log(chalk.red.underline('Peringatan: terjadi kesalahan'))
console.log(chalk.bgYellow.black('Catatan: background kuning'))
*/

const command = process.argv[2]
// console.log(process.argv)
// console.log(process.argv[2])

/*
if (command === 'tambah') {
    console.log('Tambah Catatan')
} else if (command === 'hapus') {
    console.log('Hapus Catatan')
}
*/

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
// buat instance parser yargs dengan helpers.hideBin
const y = yargs(hideBin(process.argv))

// Kustomisasi versi yargs pada instance
y.version('18.0.0')

// Membuat perintah (command) 'tambah'
y.command({
    command: 'tambah',
    describe: 'tambah sebuah catatan baru',
    builder: {
        judul: {
            describe: 'Judul catatan',
            demandOption: true,
            type: 'string'
        },
        isi: {
            describe: 'Isi catatan',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function (argv) {
        catatan.tambahCatatan(argv.judul, argv.isi)
    }
})

// Perintah hapus
y.command({
    command: 'hapus',
    describe: 'hapus catatan',
    builder: {
        judul: {
            describe: 'Judul catatan',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function (argv) {
        catatan.hapusCatatan(argv.judul)
    }
})

// Perintah list: tampilkan semua catatan (judul)
y.command({
    command: 'list',
    describe: 'Tampilkan daftar semua catatan',
    handler: function () {
        const semua = catatan.listNotes()
        console.log(chalk.green.bold(`Menampilkan ${semua.length} catatan:`))
        semua.forEach((n, i) => {
            console.log(chalk.blue(`${i + 1}. ${n.judul}`))
        })
    }
})

// Perintah baca (read): baca sebuah catatan berdasarkan judul
y.command({
    command: 'baca',
    describe: 'Baca sebuah catatan berdasarkan judul',
    builder: {
        judul: {
            describe: 'Judul catatan yang ingin dibaca',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function (argv) {
        const note = catatan.readNote(argv.judul)
        if (note) {
            console.log(chalk.green.bold(note.judul))
            console.log(note.isi || '(tidak ada isi)')
        } else {
            console.log(chalk.red(`Catatan berjudul "${argv.judul}" tidak ditemukan.`))
        }
    }
})

// letakan bagian ini pada baris terakhir
// console.log(y.argv)
y.parse()