// const fs = require('fs');
// fs.writeFileSync('catatan.txt', 'Nama saya Dafin Surya');
// fs.appendFileSync('catatan.txt', '\nSaya tinggal di Padang');

// const pesan = catatan();
// console.log(pesan);

// const validator = require('validator');
// console.log(validator.isURL('https://dafin.com'));

// const chalk = require('chalk');
// console.log(chalk.blue('Hello world!'));

// const command = process.argv[2];
/*console.log(process.argv);

if(command === 'tambah') {
    console.log('Tambah Catatan');
} else if(command === 'hapus') {
    console.log('Hapus Catatan');
}*/

const yargs = require('yargs')
const catatan = require('./catatan.js')

yargs.version('10.1.0')
yargs.command({
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
yargs.command({
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
yargs.command({
    command: 'list',
    describe: 'Menampilkan daftar semua catatan',
    handler: function () {
        catatan.listCatatan()
    }
})
yargs.command({
    command: 'baca',
    describe: 'Membaca sebuah catatan',
    builder: {
        judul: {
            describe: 'Judul catatan',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function (argv) {
        catatan.bacaCatatan(argv.judul)
    }
})
// console.log(yargs.argv)
yargs.parse()