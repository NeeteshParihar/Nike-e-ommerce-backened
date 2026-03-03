
export const generateSlug = (name, gender)=>{
    return name.toLowerCase().split(' ').join('-') + "-" + gender.toLowerCase();
}


// Inside your generation utility
export const generateSkuCode = (sku) => {

    const brand = sku.brand.substring(0, 3).toUpperCase();
    const name = sku.name.replace(/\s+/g, '').substring(0, 5).toUpperCase();
    const color = sku.colors.join("/").toUpperCase();
    const gender = sku.gender.substring(0, 1).toUpperCase(); // M, W, K
    const size = sku.size.primaryValue.toString().replace('.', ''); 

    return `${brand}-${name}-${color}-${gender}-${size}`;
};


/* 
Alphanumeric Only: Avoid special characters like @, #, or $. Use hyphens - as separators.

No Spaces: Spaces break URL parameters and CSV exports.

Avoid confusing letters: In some systems, people avoid 0 (zero) and O (letter), or 1 and I, but for automated systems, this matters less.

Fixed Length (Ideal): Try to keep the segments consistent so your barcode scanners or warehouse software can parse them easily.

*/


