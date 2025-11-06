const fs = require('fs')
const chalk = require('chalk')

const ambilCatatan = function () {
    return 'Ini Catatan Dafin Surya...'
}

const simpanCatatan = function (catatan) {
    const dataJSON = JSON.stringify(catatan)
    fs.writeFileSync('catatan.json', dataJSON)
}

const muatCatatan = function () {
    try {
        const dataBuffer = fs.readFileSync('catatan.json')
        const dataJSON = dataBuffer.toString()
        const parsed = JSON.parse(dataJSON)
        // migrate older field names {judul, isi} -> {judul, isi}
        return parsed.map(n => {
            if (n.judul && n.isi) return n
            return {
                judul: n.judul || n.judul || '(tanpa judul)',
                isi: n.isi || n.isi || ''
            }
        })
    } catch (e) {
        return []
    }
}

// tambahCatatan menyimpan objek dengan keys { judul, isi }
const tambahCatatan = function (judul, isi) {
    const catatan = muatCatatan()
    const dupe = catatan.filter(function (note) {
        return note.judul === judul
    })
    if (dupe.length === 0) {
        catatan.push({
            judul: judul,
            isi: isi
        })
        simpanCatatan(catatan)
        console.log(chalk.green('Catatan baru ditambahkan!'))
    } else {
        console.log(chalk.red('Judul catatan telah dipakai'))
    }
}

const hapusCatatan = function (judul) {
    const catatan = muatCatatan()
    const catatanUntukDisimpan = catatan.filter(function (note) {
        return note.judul !== judul
    })
    if (catatan.length > catatanUntukDisimpan.length) {
        console.log(chalk.green.inverse('Catatan dihapus!'))
        simpanCatatan(catatanUntukDisimpan)
    } else {
        console.log(chalk.red.inverse('Catatan tidak ditemukan!'))
    }
}

const listNotes = function () {
    return muatCatatan()
}

const readNote = function (judul) {
    const catatan = muatCatatan()
    return catatan.find(n => n.judul === judul)
}

module.exports = {
    ambilCatatan: ambilCatatan,
    tambahCatatan: tambahCatatan,
    hapusCatatan: hapusCatatan,
    listNotes: listNotes,
    readNote: readNote
}
