
export const generateSlug = (name)=>{
    return name.toLowerCase().split(' ').join('-')
}