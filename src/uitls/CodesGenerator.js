
export const generateSlug = (name)=>{
    return name.toLowerCase().split(' ').join('-')
}


export const generateSkuCode = ({brand, name, color, size}) => {

    const b = brand.substring(0, 3).toUpperCase();  // Nike
    // Remove spaces/special chars from name and take first 5 
    const n = name.replace(/\s+/g, '').substring(0, 5).toUpperCase(); // Jordan 1
    const c = color.substring(0, 3).toUpperCase(); // university Red
    const s = size.toString().replace('.', '').toUpperCase(); // 10.5 becomes 105 

    return `${b}-${n}-${c}-${s}`;
};


/* 

Alphanumeric Only: Avoid special characters like @, #, or $. Use hyphens - as separators.

No Spaces: Spaces break URL parameters and CSV exports.

Avoid confusing letters: In some systems, people avoid 0 (zero) and O (letter), or 1 and I, but for automated systems, this matters less.

Fixed Length (Ideal): Try to keep the segments consistent so your barcode scanners or warehouse software can parse them easily.

*/