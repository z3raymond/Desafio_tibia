const readline=require('readline')
const fs =require('fs')
const readable=fs.createReadStream('tibia_server.log')

const rl=readline.createInterface({

    input:readable,
    output:process.stdout
})