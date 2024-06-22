export function format_number(format:string, n:number){
    // number of # in the format string will be replaced by the number with leading zeros

    let precision = format.match(/#/g)?.length || 0;
    console.log(precision);
    let n_str = n.toString();
    let n_str_len = n_str.length;
    if (n_str_len < precision) {
        let zeros = "0".repeat(precision - n_str_len);
        n_str = zeros + n_str
    }
    let formatted = format.replace(/#+/g, n_str);
    return formatted;
}

export function extract_number(format:string, n_str:string){
    let n = parseInt(n_str.replace(/[\D\.]/g, ""));
    return n;
}