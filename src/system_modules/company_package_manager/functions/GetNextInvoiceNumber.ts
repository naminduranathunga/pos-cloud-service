import {readFileSync, writeFileSync} from 'fs';

export default function GetNextInvoiceNumber(){
    // load file from data
    let next_number = 0;
    try {
        next_number = parseInt(readFileSync("data/invoice_number.txt").toString());
    } catch (error) {
        console.log("Error reading file", error);
    }
    const inv_number = `INV-${next_number}`;
    next_number++;

    // save next number to file
    try {
        writeFileSync("data/invoice_number.txt", next_number.toString());
    } catch (error) {
        console.log("Error writing file", error);
    }
    
    return inv_number;
}
