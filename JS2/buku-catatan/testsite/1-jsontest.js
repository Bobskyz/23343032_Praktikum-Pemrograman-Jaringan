const fs = require('fs')

/*
const buku = {
    judul: 'Pemrograman Jaringan',
    penulis: 'Dafin Surya'
}
const bookJSON = JSON.stringify(buku)
fs.writeFileSync('1-jsontest.json', bookJSON)
*/

const dataBuffer = fs.readFileSync('1-jsontest.json')
const dataJSON = dataBuffer.toString()
const data = JSON.parse(dataJSON)
console.log(data.judul)
